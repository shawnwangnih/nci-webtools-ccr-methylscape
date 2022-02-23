import { atom, selector } from 'recoil';
import groupBy from 'lodash/groupBy';
import chrLines from './lines.json';

export const defaultFormState = {
  annotation: 'none',
};

export const formState = atom({
  key: 'copynumber.formState',
  default: defaultFormState,
});

export const defaultCopyNumberState = {
  idatFilename: '',
};

export const copyNumberState = atom({
  key: 'copyNumberState',
  default: defaultCopyNumberState,
});

export const defaultPlotState = {
  data: [],
  layout: {},
  config: {},
};

export const plotState = selector({
  key: 'cnaPlot',
  get: async ({ get }) => {
    const { idatFilename } = get(copyNumberState);
    const { annotation: annoToggle } = get(formState);

    if (!idatFilename) return defaultPlotState;
    try {
      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: idatFilename,
        }),
      };
      // temporary - use static data if idatFilename is unavailable
      const { bin, seg } = await (
        await fetch('api/getCopyNumber', options)
      ).json();

      // get chromosome as index from string
      function getChr(chr) {
        return parseInt(
          chr.includes('X')
            ? 23
            : chr.includes('Y')
            ? 24
            : chr.replace(/^chr/, '')
        );
      }

      // parse bins
      const bins = bin.map((e) => {
        let newBin = {
          ...e,
          position: (parseInt(e.Start) + parseInt(e.End)) / 2,
          log2ratio: parseFloat(e[Object.keys(e)[Object.keys(e).length - 1]]),
          chr: getChr(e.Chromosome),
        };
        delete newBin.Chromosome;
        return newBin;
      });

      // get range of position per chromosome
      const binPosOffset = Object.values(
        bins.reduce((prev, curr) => {
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
          x1: binPosOffset[chr] + parseInt(e['loc.start']),
          x2: binPosOffset[chr] + parseInt(e['loc.end']),
          width: e['loc.end'] - parseInt(e['loc.start']),
          posStartNew: segPosOffset[chr] + parseInt(e['loc.start']),
          posEndNew: segPosOffset[chr] + parseInt(e['loc.end']),
        };
      });

      // group bins by chromosome
      const dataGroupedByChr = Object.entries(
        groupBy(
          bins.map((d) => ({
            chr: d.chr,
            position: d.position + binPosOffset[d.chr],
            log2ratio: d.log2ratio,
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
          customdata: data.map((e) => ({
            position: e.position || '',
            ratio: e.log2ratio || '',
          })),
          mode: 'markers',
          type: 'scattergl',
          hovertemplate:
            'Log<sub>2</sub> Ratio: %{customdata.ratio}<br>Position: %{x}<extra></extra>',
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

      const ratios = bins.map(({ log2ratio }) => log2ratio);
      const yMin = Math.min(...ratios) - 0.1;
      const yMax = Math.max(...ratios) + 0.1;

      const layout = {
        showlegend: false,
        dragmode: 'pan',
        uirevision: idatFilename + annoToggle,
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
        data: [...dataTraces],
        layout,
        config,
      };
    } catch (error) {
      console.log(error);
      return { error: 'Unavailable' };
    }
  },
});
