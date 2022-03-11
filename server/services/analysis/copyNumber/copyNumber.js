const { getKey, getDataFile } = require('../../aws');
const { groupBy, chunk } = require('lodash');
const Papa = require('papaparse');
const chrLines = require('./lines.json');
const { aws: awsConfig } = require('../../../config');

async function parseTSV(stream, options = {}) {
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

async function getCopyNumber(request) {
  const { id, search, annotation } = request.body;
  const { connection } = request.app.locals;
  const keyPrefix = awsConfig.s3DataKey || 'methylscape/';

  // find and parse files
  const binFind = await getKey(keyPrefix + 'CNV/bins/' + id);
  const binKey = binFind.Contents[0].Key;

  // const probeFind = await getKey(keyPrefix + 'CNV/probes/' + id);
  // const probeKey = probeFind.Contents[0].Key;

  const segFind = await getKey(keyPrefix + 'CNV/segments/' + id);
  const segKey = segFind.Contents[0].Key;

  const binFile = await getDataFile(binKey);
  // const probeFile = await getDataFile(probeKey);
  const segFile = await getDataFile(segKey);

  // fix for files that contain an extra column that is not defined
  const parseFixDimensions = {
    beforeFirstChunk: (chunk) => {
      let lines = chunk.split(/\r\n|\r|\n/);
      lines[0] = 'row\t' + lines[0];
      return lines.join('\n');
    },
  };

  const bin = await parseTSV(binFile.Body, parseFixDimensions);
  // const probe = await parseTSV(probeFile.Body, parseFixDimensions);
  const seg = await parseTSV(segFile.Body, parseFixDimensions);

  // get chromosome as index from string
  function getChr(chr) {
    return parseInt(
      chr.includes('X') ? 23 : chr.includes('Y') ? 24 : chr.replace(/^chr/, '')
    );
  }

  // const probesByChr = groupBy(
  //   probe.map((d) => ({
  //     start: d.Start,
  //     end: d.End,
  //     feature: d.Feature,
  //     chr: d.Chromosome,
  //   })),
  //   (e) => e.chr
  // );

  // function getProbes(chr, start, end) {
  //   const probes = probesByChr[chr]
  //     .filter((e) => e.start >= start && e.end <= end)
  //     .map((e) => e.feature);

  //   console.log(probes.length);

  //   return probes;
  // }

  async function getGenes(chr, start, end) {
    const query = await connection('genes')
      .select('*')
      .where({ chr })
      .andWhere((e) => {
        e.whereBetween('start', [start, end]).orWhereBetween('end', [
          start,
          end,
        ]);
      });
    return query.map((e) => e.geneID);
  }

  // parse bins
  const bins = await Promise.all(
    bin.map(async (e) => ({
      position: Math.round((parseInt(e.Start) + parseInt(e.End)) / 2),
      log2ratio: parseFloat(e[Object.keys(e)[Object.keys(e).length - 1]]),
      chr: getChr(e.Chromosome),
      genes: await getGenes(e.Chromosome, e.Start, e.End),
      // probes: getProbes(e.Chromosome, e.Start, e.End),
    }))
  );

  // get range of position per chromosome
  const binPosOffset = Object.values(
    bins.reduce((a, c) => {
      if (c.chr != 24) {
        if (a[c.chr]) {
          return {
            ...a,
            [c.chr]: Math.max(a[c.chr], c.position),
          };
        } else {
          return {
            ...a,
            [c.chr]: c.position || 0,
          };
        }
      } else return a;
    }, {})
  )
    .reduce((a, c, i) => [...a, c + (a[i - 1] || 0)], [])
    .reduce((a, c, i) => ({ ...a, [i + 2]: c }), { 1: 0 });

  // const segPosOffset = Object.values(
  //   seg.reduce((a, c) => {
  //     const chr = getChr(c.chrom);
  //     if (chr != 24) {
  //       if (a[chr]) {
  //         return {
  //           ...a,
  //           [chr]: Math.max(a[chr], parseInt(c['loc.start'])),
  //         };
  //       } else {
  //         return {
  //           ...a,
  //           [chr]: parseInt(c['loc.start']),
  //         };
  //       }
  //     } else return a;
  //   }, {})
  // )
  //   .reduce((a, c, i) => [...a, c + (a[i - 1] || 0)], [])
  //   .reduce((a, c, i) => ({ ...a, [i + 2]: c }), { 1: 0 });

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
      // chr: chr,
      // posStart: parseInt(e['loc.start']),
      // posEnd: parseInt(e['loc.end']),
      medianLog2Ratio: parseFloat(e['seg.median']),
      // CNV: cnv(parseFloat(e['seg.median'])),
      x1: binPosOffset[chr] + parseInt(e['loc.start']),
      x2: binPosOffset[chr] + parseInt(e['loc.end']),
      // width: e['loc.end'] - parseInt(e['loc.start']),
      // posStartNew: segPosOffset[chr] + parseInt(e['loc.start']),
      // posEndNew: segPosOffset[chr] + parseInt(e['loc.end']),
    };
  });

  // annotate bins by search query
  const searchQueries = search.map(({ value }) => value.toLowerCase());
  const searchAnnotations = searchQueries.length
    ? bins
        .filter(
          ({ probe }) => probe
          // &&searchQueries.some((query) => probe.toLowerCase().includes(query))
        )
        .map((e) => ({
          text: e.probe,
          x: binPosOffset[e.chr] + e.position,
          y: e.log2ratio,
        }))
    : [];

  // group bins by chromosome
  const dataGroupedByChr = Object.entries(
    groupBy(
      bins.map((d) => ({
        ...d,
        position: d.position + binPosOffset[d.chr],
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
      customdata: data.map(({ genes }) => ({ genes })),
      mode: 'markers',
      type: 'scattergl',
      hovertemplate:
        'Genes: %{customdata.genes}<br>Log<sub>2</sub> Ratio: %{y}<br>Position: %{x}<extra></extra>',
      marker: {
        color: data.map((e) => e.log2ratio),
        // colorscale: [
        //   ['0.0', `hsl(${getHue(i)}, 100%, 40%)`],
        //   ['0.25', `hsl(${getHue(i)}, 100%, 60%)`],
        //   ['0.5', `hsl(${getHue(i)}, 50%, 90%)`],
        //   ['0.75', `hsl(${getHue(i)}, 100%, 60%)`],
        //   ['1.0', `hsl(${getHue(i)}, 100%, 40%)`],
        // ],
        cmax: 0.7,
        cmid: 0,
        cmin: -0.7,
      },
    }));

  const yMin =
    bins.reduce((a, c) => (a < c.log2ratio ? a : c.log2ratio)) - 0.25;
  const yMax =
    bins.reduce((a, c) => (a > c.log2ratio ? a : c.log2ratio)) + 0.25;

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
      dtick: 0.25,
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
