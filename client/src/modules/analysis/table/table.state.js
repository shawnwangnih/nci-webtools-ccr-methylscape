import { atom, selector } from 'recoil';
import axios from 'axios';
import { selectedPoints } from '../metadata/metadata-plot.state';
import pick from 'lodash/pick';

export const defaultTableForm = {
  group: 0,
};

export const tableForm = atom({
  key: 'umapTableForm',
  default: defaultTableForm,
});

export const tableData = selector({
  key: 'umapSelectedTable',
  get: ({ get }) => {
    const { points } = get(selectedPoints);

    const columns = [
      {
        accessor: 'sample',
        Header: 'sample',
      },
      {
        accessor: 'idatFilename',
        Header: 'idatFilename',
      },
      {
        accessor: 'nihLabels',
        Header: 'nihLabels',
        show: false,
      },
      {
        accessor: 'nciMetric',
        Header: 'nciMetric',
      },
      {
        accessor: 'nciGroup',
        Header: 'nciGroup',
        show: false,
      },
      {
        accessor: 'v11b6',
        Header: 'v11b6',
      },
      {
        accessor: 'age',
        Header: 'age',
      },
      {
        accessor: 'sex',
        Header: 'sex',
      },
      {
        accessor: 'diagnosisProvided',
        Header: 'diagnosisProvided',
      },
      {
        accessor: 'locationGeneral',
        Header: 'locationGeneral',
      },
      {
        accessor: 'locationSpecific',
        Header: 'locationSpecific',
      },
      {
        accessor: 'details',
        Header: 'details',
        show: false,
      },
      {
        accessor: 'variants',
        Header: 'variants',
      },
      {
        accessor: 'fusionsOrTranslocations',
        Header: 'fusionsOrTranslocations',
      },
      {
        accessor: 'fusionsOrTranslocationsReport',
        Header: 'fusionsOrTranslocationsReport',
        show: false,
      },
      {
        accessor: 'lp_cp_number',
        Header: 'lp_cp_number',
        show: false,
      },
      {
        accessor: 'subtypeOrPattern',
        Header: 'subtypeOrPattern',
        show: false,
      },
      {
        accessor: 'who_2007_grade',
        Header: 'who_2007_grade',
        show: false,
      },
      {
        accessor: 'MCF1_v11b6',
        Header: 'MCF1_v11b6',
        show: false,
      },
      {
        accessor: 'MCF1_v11b6_score',
        Header: 'MCF1_v11b6_score',
        show: false,
      },
      {
        accessor: 'SC1_v11b6',
        Header: 'SC1_v11b6',
        show: false,
      },
      {
        accessor: 'SC1_v11b6_score',
        Header: 'SC1_v11b6_score',
        show: false,
      },
      {
        accessor: 'MCF_v12_3',
        Header: 'MCF_v12_3',
        show: false,
      },
      {
        accessor: 'MCF_v12_3_score',
        Header: 'MCF_v12_3_score',
        show: false,
      },
      {
        accessor: 'MCF_v12_5',
        Header: 'MCF_v12_5',
        show: false,
      },
      {
        accessor: 'MCF_v12_5_score',
        Header: 'MCF_v12_5_score',
        show: false,
      },
      {
        accessor: 'GSM_accession',
        Header: 'GSM_accession',
        show: false,
      },
      {
        accessor: 'dkfzBrainTumorClassifier',
        Header: 'dkfzBrainTumorClassifier',
        show: false,
      },
      {
        accessor: 'primaryStudy',
        Header: 'primaryStudy',
        show: false,
      },
      {
        accessor: 'centerMethylation',
        Header: 'centerMethylation',
        show: false,
      },
      {
        accessor: 'accessionMethy',
        Header: 'accessionMethy',
        show: false,
      },
      {
        accessor: 'samplingTreatment',
        Header: 'samplingTreatment',
        show: false,
      },
      {
        accessor: 'locationMetastasis',
        Header: 'locationMetastasis',
        show: false,
      },
      {
        accessor: 'type',
        Header: 'type',
        show: false,
      },
      {
        accessor: 'primaryCategory',
        Header: 'primaryCategory',
        show: false,
      },
      {
        accessor: 'diagnosisT1',
        Header: 'diagnosisT1',
        show: false,
      },
      {
        accessor: 'diagnosisT2',
        Header: 'diagnosisT2',
        show: false,
      },
      {
        accessor: 'diagnosisT3',
        Header: 'diagnosisT3',
        show: false,
      },
      {
        accessor: 'who_diagnosisT4',
        Header: 'who_diagnosisT4',
        show: false,
      },
      {
        accessor: 'batchDate',
        Header: 'batchDate',
        show: false,
      },
      {
        accessor: 'matchedCases',
        Header: 'matchedCases',
        show: false,
      },
      {
        accessor: 'sexCongruency',
        Header: 'sexCongruency',
        show: false,
      },
      {
        accessor: 'sexPrediction',
        Header: 'sexPrediction',
        show: false,
      },
      {
        accessor: 'h3k27me3',
        Header: 'h3k27me3',
        show: false,
      },
      {
        accessor: 'variantsReport',
        Header: 'variantsReport',
        show: false,
      },
      {
        accessor: 'overallSurvivalMonths',
        Header: 'overallSurvivalMonths',
        show: false,
      },
      {
        accessor: 'overallSurvivalStatus',
        Header: 'overallSurvivalStatus',
        show: false,
      },
      {
        accessor: 'sampling',
        Header: 'sampling',
        show: false,
      },
    ];

    const tables = points.reduce(
      (prev, data, i) => ({
        ...prev,
        [i]: {
          cols: columns,
          data: data.length
            ? data.map((e) =>
                pick(
                  e.customdata,
                  columns.map((e) => e.accessor)
                )
              )
            : [],
        },
      }),
      {}
    );

    return tables;
  },
});

const selectedPoints_intermediate = selector({
  key: 'selectedPoints_intermediate',
  get: ({ get }) => {
    const { points } = get(selectedPoints);
    const filterPoints = points.filter((v) => v.length);

    if (!filterPoints.length) return '[]';

    const survivalData = filterPoints
      .map((data, i) => ({
        [parseInt(i) + 1]: data
          .map((e) => e.customdata)
          .filter(
            ({ overallSurvivalMonths, overallSurvivalStatus }) =>
              overallSurvivalMonths &&
              (overallSurvivalStatus || overallSurvivalStatus == 0)
          )
          .map(({ overallSurvivalMonths, overallSurvivalStatus }) => ({
            overallSurvivalMonths,
            overallSurvivalStatus,
          })),
      }))
      .reduce((prev, curr) => {
        const groupName = Object.keys(curr)[0];
        return [
          ...prev,
          ...curr[groupName].map((d) => ({
            group: groupName,
            overallSurvivalMonths: d.overallSurvivalMonths,
            overallSurvivalStatus: d.overallSurvivalStatus,
          })),
        ];
      }, []);

    return JSON.stringify(survivalData);
  },
});

export const survivalDataSelector = selector({
  key: 'survivalDataSelector',
  get: async ({ get }) => {
    const selectedPoints = JSON.parse(get(selectedPoints_intermediate));
    if (selectedPoints?.length) {
      const response = await axios.post('api/survival', selectedPoints);
      return response.data;
    } else {
      return null;
    }
  },
});
