import { atom, selector } from 'recoil';
import axios from 'axios';
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

    const params = { embedding, organSystem };
    const { data } = await axios.get('api/samples', { params });

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

    const weeklyThreshold = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const isWeeklyAnnotation = ({ batchDate }) =>
      batchDate && new Date(batchDate).getTime() > weeklyThreshold;
    const weeklyAnnotations = data.filter(isWeeklyAnnotation).map((value) => ({
      text: value.sample,
      x: value.x,
      y: value.y,
      showarrow: true,
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
        hovertemplate:
          'Sample: %{customdata.sample}<br>Metric: %{customdata.nciMetric}<br>Diagnosis: %{customdata.diagnosisProvided}<extra></extra>',
        type: useWebGl ? 'scattergl' : 'scatter',
        marker: {
          color: '%{customdata.nciMetric}',
        },
      }));

    const plotTitles = {
      centralNervousSystem: 'Central Nervous System',
      boneAndSoftTissue: 'Bone and Soft Tissue',
      hematopoietic: 'Hematopoietic',
      renal: 'Renal',
      panCancer: 'Pan-Cancer',
    };

    // set layout
    const layout = {
      title: `${plotTitles[organSystem] || organSystem} (n=${data.length})`,
      xaxis: {
        title: `${embedding} x`,
      },
      yaxis: {
        title: `${embedding} y`,
      },
      annotations: showAnnotations
        ? [
            // ...labelAnnotations,
            // ...sampleAnnotations,
            // ...classAnnotations
            ...weeklyAnnotations,
          ]
        : [...sampleAnnotations],
      uirevision: organSystem + embedding + search + showAnnotations,
      legend: { title: { text: 'Methylation Class' } },
      colorway: colors,
      autosize: true,
      dragmode: 'select',
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
