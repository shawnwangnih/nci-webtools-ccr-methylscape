import { atom, selector } from 'recoil';
import { query } from '../../../services/query';
import groupBy from 'lodash/groupBy';
import meanBy from 'lodash/meanBy';
import colors from './colors.json';

export const defaultFormState = {
  organSystem: 'centralNervousSystem',
  embedding: 'umap',
  search: [],
  showAnnotations: true,
  methylClass: '',
};

export const formState = atom({
  key: 'metadataPlot.formState',
  default: defaultFormState,
});

export const defaultSelectedPoints = {
  points: [[]],
};

export const selectedPoints = atom({
  key: 'metadataPlot.selected',
  default: defaultSelectedPoints,
});

export const defaultPlotState = {
  data: [],
  layout: {},
  config: {},
};

export const plotState = selector({
  key: 'metadataPlot.plotState',
  get: async ({ get }) => {
    const { organSystem, embedding, search, showAnnotations, methylClass } =
      get(formState);

    if (!organSystem || !embedding) return defaultPlotState;

    let data = await query('api/samples', { embedding, organSystem });

    // filter plot by search if show annotations is toggled false
    const searchQueries = search.map(({ value }) => value.toLowerCase());
    // if (!showAnnotations && searchQueries.length) {
    //   data = data.filter(
    //     ({ sample, idatFilename }) =>
    //       (sample &&
    //         searchQueries.some((query) =>
    //           sample.toLowerCase().includes(query)
    //         )) ||
    //       (idatFilename &&
    //         searchQueries.some((query) =>
    //           idatFilename.toLowerCase().includes(query)
    //         ))
    //   );
    // }

    const useWebGl = data.length > 1000;
    const dataGroupedByClass = Object.entries(groupBy(data, (e) => e.v11b6));
    const dataGroupedByLabel = Object.entries(groupBy(data, (e) => e.nihLabel));

    // use mean x/y values for annotation positions
    const labelAnnotations = dataGroupedByLabel
      .filter(
        ([name, value]) => !['null', 'undefined', ''].includes(String(name))
      )
      .map(([name, value]) => ({
        text: name,
        x: meanBy(value, (e) => e.x),
        y: meanBy(value, (e) => e.y),
        showarrow: false,
      }));

    const classAnnotations = dataGroupedByClass
      .filter(
        ([name, value]) => !['null', 'undefined', ''].includes(String(name))
      )
      .map(([name, value]) => ({
        text: name,
        x: meanBy(value, (e) => e.x),
        y: meanBy(value, (e) => e.y),
        showarrow: false,
      }));

    // add annotations from search filter
    const sampleAnnotations = searchQueries.length
      ? data
          .filter(
            ({ sample, idatFilename }) =>
              (sample &&
                searchQueries.some((query) =>
                  sample.toLowerCase().includes(query)
                )) ||
              (idatFilename &&
                searchQueries.some((query) =>
                  idatFilename.toLowerCase().includes(query)
                ))
          )
          .map((e) => ({
            text: e.sample || e.idatFilename,
            x: e.x,
            y: e.y,
            // showarrow: false,
          }))
      : [];

    // transform data to traces
    const dataTraces = dataGroupedByClass
      .sort((a, b) =>
        a[0] == 'No_match'
          ? -1
          : b[0] == 'No_match'
          ? 1
          : a[0].localeCompare(b[0])
      )
      .map(([name, data]) => ({
        name,
        x: data.map((e) => e.x),
        y: data.map((e) => e.y),
        customdata: data,
        mode: 'markers',
        hovertemplate: 'Sample: %{customdata.sample}<extra></extra>',
        type: useWebGl ? 'scattergl' : 'scatter',
        marker: {
          color: '%{customdata.class}',
        },
      }));

    // try using webgl to display class annotations to improve performance
    const classAnnotationTrace = dataGroupedByClass
      .filter(
        ([name, value]) => !['null', 'undefined', ''].includes(String(name))
      )
      .map(([name, value]) => ({
        text: name,
        x: meanBy(value, (e) => e.x),
        y: meanBy(value, (e) => e.y),
      }))
      .reduce(
        (acc, curr) => {
          acc.x.push(curr.x);
          acc.y.push(curr.y);
          acc.text.push(curr.text);
          return acc;
        },
        {
          x: [],
          y: [],
          text: [],
          mode: 'text',
          type: useWebGl ? 'scattergl' : 'scatter',
          textfont: {
            size: 10,
          },
        }
      );

    function plotTitle(organSystem) {
      if (organSystem == 'centralNervousSystem')
        return 'Central Nervous System';
      if (organSystem == 'centralNervousSystemSarcoma') return 'CNS Sarcoma';
      if (organSystem == 'boneAndSoftTissue') return 'Bone and Soft Tissue';
      if (organSystem == 'hematopoietic') return 'Hematopoietic';
    }

    // set layout
    const layout = {
      title: `${plotTitle(organSystem)} (n=${data.length})`,
      xaxis: {
        title: `${embedding} x`,
      },
      yaxis: {
        title: `${embedding} y`,
      },
      annotations: showAnnotations
        ? [
            ...labelAnnotations,
            ...sampleAnnotations,
            // ...classAnnotations
          ]
        : [...sampleAnnotations],
      uirevision: organSystem + embedding + search + showAnnotations,
      legend: { title: { text: 'Methylation Class' } },
      colorway: colors,
    };

    const config = {
      scrollZoom: true,
    };

    return {
      data: [
        ...dataTraces,
        // classAnnotationTrace,
      ],
      layout,
      config,
    };
  },
});
