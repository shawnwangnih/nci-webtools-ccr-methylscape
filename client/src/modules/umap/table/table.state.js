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
      'sample',
      'age',
      'sexPrediction',
      // 'histology',
      'subtypeOrPattern',
      'WHO_2007_grade',
      // 'molecular',
      'locationGeneral',
      'locationSpecific',
      'sampling',
      'samplingTreatment',
      'idatFilename',
    ];

    const tables = points.reduce(
      (prev, data, i) => ({
        ...prev,
        [i]: {
          cols: data.length
            ? columns.map((e) => ({ id: e, accessor: e, Header: e }))
            : [],
          data: data.length ? data.map((e) => pick(e.customdata, columns)) : [],
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

    if (!filterPoints.length) return '';

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
          ...curr[groupName].map((d) =>
            JSON.stringify({
              group: groupName,
              overallSurvivalMonths: d.overallSurvivalMonths,
              overallSurvivalStatus: d.overallSurvivalStatus,
            })
          ),
        ];
      }, []);

    return JSON.stringify(survivalData);
  },
});

export const survivalPlot = selector({
  key: 'survivalPlot',
  get: async ({ get }) => {
    const data = get(selectedPoints_intermediate);

    if (!data.length) return '';

    const parseData = JSON.parse(data).map(JSON.parse);

    try {
      const response = await axios.post('api/r', {
        fn: 'survival',
        args: parseData,
      });

      return response.data.output;
    } catch (error) {
      console.log(error);
      return '';
    }
  },
});
