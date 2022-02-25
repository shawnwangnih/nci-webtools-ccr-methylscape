const { getKey, getDataFile } = require('../../aws');
const { groupBy } = require('lodash');
const Papa = require('papaparse');
const chrLines = require('./lines.json');

async function parseTSV(stream, options) {
  return new Promise((resolve, reject) => {
    let data = [];
    const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
      ...options,
      header: true,
    });
    stream.pipe(parseStream);
    parseStream.on('error', (e) => {
      reject(e);
    });
    parseStream.on('data', (d) => {
      data.push(d);
    });
    parseStream.on('end', () => {
      resolve(data);
    });
  });
}

async function getCopyNumber({ id, search }) {
  // find and parse files
  const probeFind = await getKey('methylscape/CNV/probes/' + id);
  const probeKey = probeFind.Contents[0].Key;

  const segFind = await getKey('methylscape/CNV/segments/' + id);
  const segKey = segFind.Contents[0].Key;

  const probeFile = await getDataFile(probeKey);
  const segFile = await getDataFile(segKey);

  const probe = await parseTSV(probeFile.Body, {
    beforeFirstChunk: (chunk) => {
      let lines = chunk.split(/\r\n|\r|\n/);
      lines[0] = 'row\t' + lines[0];
      return lines.join('\n');
    },
  });
  const seg = await parseTSV(segFile.Body, {
    beforeFirstChunk: (chunk) => {
      let lines = chunk.split(/\r\n|\r|\n/);
      lines[0] = 'row\t' + lines[0];
      return lines.join('\n');
    },
  });
  // get chromosome as index from string
  function getChr(chr) {
    return parseInt(
      chr.includes('X') ? 23 : chr.includes('Y') ? 24 : chr.replace(/^chr/, '')
    );
  }

  // parse probes
  const probes = probe.map((e) => ({
    position: (parseInt(e.Start) + parseInt(e.End)) / 2,
    log2ratio: parseFloat(e[Object.keys(e)[Object.keys(e).length - 1]]),
    chr: getChr(e.Chromosome),
    probe: e.Feature,
  }));

  // get range of position per chromosome
  const probePosOffset = Object.values(
    probes.reduce((prev, curr) => {
      if (curr.chr != 24) {
        if (prev[curr.chr]) {
          return {
            ...prev,
            [curr.chr]: Math.max(prev[curr.chr], curr.position),
          };
        } else {
          return {
            ...prev,
            [curr.chr]: curr.position || 0,
          };
        }
      } else return prev;
    }, {})
  )
    .reduce((prev, curr, i) => [...prev, curr + (prev[i - 1] || 0)], [])
    .reduce((prev, curr, i) => ({ ...prev, [i + 2]: curr }), { 1: 0 });

  const segPosOffset = Object.values(
    seg.reduce((prev, curr) => {
      const chr = getChr(curr.chrom);
      if (chr != 24) {
        if (prev[chr]) {
          return {
            ...prev,
            [chr]: Math.max(prev[chr], parseInt(curr['loc.start'])),
          };
        } else {
          return {
            ...prev,
            [chr]: parseInt(curr['loc.start']),
          };
        }
      } else return prev;
    }, {})
  )
    .reduce((prev, curr, i) => [...prev, curr + (prev[i - 1] || 0)], [])
    .reduce((prev, curr, i) => ({ ...prev, [i + 2]: curr }), { 1: 0 });

  // parse segments
  const segments = seg.map((e) => {
    const cnv = (median) => {
      if (median <= -0.6) return 'deletion';
      if (median > -0.6 && median <= -0.1) return 'loss';
      if (median > 0.1 && median < 0.6) return 'gain';
      if (median >= 0.6) return 'amplification';
      return '';
    };
    const chr = getChr(e.chrom);

    return {
      chr: chr,
      posStart: parseInt(e['loc.start']),
      posEnd: parseInt(e['loc.end']),
      medianLog2Ratio: parseFloat(e['seg.median']),
      CNV: cnv(parseFloat(e['seg.median'])),
      x1: probePosOffset[chr] + parseInt(e['loc.start']),
      x2: probePosOffset[chr] + parseInt(e['loc.end']),
      width: e['loc.end'] - parseInt(e['loc.start']),
      posStartNew: segPosOffset[chr] + parseInt(e['loc.start']),
      posEndNew: segPosOffset[chr] + parseInt(e['loc.end']),
    };
  });

  // annotate probes by search query
  const searchQueries = search.map(({ value }) => value.toLowerCase());
  const searchAnnotations = searchQueries.length
    ? probes
        .filter(
          ({ probe }) =>
            probe &&
            searchQueries.some((query) => probe.toLowerCase().includes(query))
        )
        .map((e) => ({
          text: e.probe,
          x: e.position,
          y: e.log2ratio,
        }))
    : [];

  // group probes by chromosome
  const dataGroupedByChr = Object.entries(
    groupBy(
      probes.map((d) => ({
        chr: d.chr,
        position: d.position + probePosOffset[d.chr],
        log2ratio: d.log2ratio,
        probe: d.probe,
      })),
      (e) => e.chr
    )
  );

  // hsl hue - degress of a color wheel
  const getHue = (i) => {
    if (i > 7) return 45 * (i % 8);
    else return 45 * i;
  };

  // transform data to traces
  const dataTraces = dataGroupedByChr
    .sort(([chrA], [chrB]) => parseInt(chrA) - parseInt(chrB))
    .map(([chr, data], i) => ({
      chr,
      x: data.map((e) => e.position),
      y: data.map((e) => e.log2ratio),
      customdata: data.map((e) => ({ probe: e.probe })),
      mode: 'markers',
      type: 'scattergl',
      hovertemplate:
        'Probe: %{customdata.probe}<br>Log<sub>2</sub> Ratio: %{y}<br>Position: %{x}<extra></extra>',
      marker: {
        color: data.map((e) => e.log2ratio),
        // colorscale: [
        //   ['0.0', `hsl(${getHue(i)}, 100%, 40%)`],
        //   ['0.25', `hsl(${getHue(i)}, 100%, 60%)`],
        //   ['0.5', `hsl(${getHue(i)}, 50%, 90%)`],
        //   ['0.75', `hsl(${getHue(i)}, 100%, 60%)`],
        //   ['1.0', `hsl(${getHue(i)}, 100%, 40%)`],
        // ],
        cmax: 3,
        cmid: 0,
        cmin: -3,
      },
    }));

  const yMin =
    probes.reduce((prev, curr) =>
      prev < curr.log2ratio ? prev : curr.log2ratio
    ) - 1.5;
  const yMax =
    probes.reduce((prev, curr) =>
      prev > curr.log2ratio ? prev : curr.log2ratio
    ) + 1.5;

  // let annotations = await query('api/annotations', {});
  // console.log(annotations);
  const layout = {
    showlegend: false,
    dragmode: 'pan',
    xaxis: {
      title: 'Chromosome',
      showgrid: false,
      showline: true,
      tickmode: 'array',
      tickvals: chrLines.map(({ center }) => center),
      ticktext: chrLines.map(({ chr }) => chr),
      tickangle: 0,
    },
    yaxis: {
      title: 'log<sub>2</sub> ratio',
      zeroline: true,
      // zerolinecolor: '#eee',
      dtick: 0.5,
      ticks: 'outside',
      fixedrange: true,
    },
    annotations: [...searchAnnotations],
    shapes: [
      // chromosome dividers
      ...chrLines.map((e) => ({
        type: 'line',
        x0: e['pos.start'],
        x1: e['pos.start'],
        y0: yMin,
        y1: yMax,
        line: { width: 1 },
      })),
      // chromosome segment divider
      ...chrLines.map((e) => ({
        type: 'line',
        x0: e['pq'],
        x1: e['pq'],
        y0: yMin,
        y1: yMax,
        line: { dash: 'dot', width: 1 },
      })),
      // chromosome segments
      ...segments.map((e) => ({
        type: 'line',
        x0: e['x1'],
        x1: e['x2'],
        y0: e['medianLog2Ratio'],
        y1: e['medianLog2Ratio'],
      })),
      // y-axis zero line
      {
        type: 'line',
        y0: 0,
        y1: 0,
        line: { dash: 'dot' },
      },
    ],
    autosize: true,
  };
  const config = { scrollZoom: true };

  return {
    data: dataTraces,
    layout,
    config,
  };
}

module.exports = { getCopyNumber };
