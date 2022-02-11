import { atom, selector } from 'recoil';
import axios from 'axios';
import { selectedPoints } from '../metadata/metadata-plot.state';

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

    const tables = points.reduce(
      (prev, data, i) => ({
        ...prev,
        [i]: {
          cols: data.length
            ? Object.keys(data[0].customdata).map((e) => ({
                id: e,
                accessor: e,
                Header: e,
              }))
            : [],
          data: data.length ? data.map((e) => e.customdata) : [],
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
    const data = points.filter((v) => v.length).map((v) => JSON.stringify(v));

    return data;
  },
});

export const survivalPlot = selector({
  key: 'survivalPlot',
  get: async ({ get }) => {
    // const points = get(selectedPoints_intermediate);

    // const filterPoints = Object.fromEntries(
    //   Object.entries(points).filter(([group, points]) => points.length)
    // );
    // const groups = Object.keys(filterPoints);
    const { points } = get(selectedPoints);

    if (!points.length) return '';

    const survivalData = points
      .map((data, i) => ({
        [parseInt(i) + 1]: data
          .map((e) => e.customdata)
          .filter(
            ({ os_months, os_status }) =>
              os_months && (os_status || os_status == 0)
          )
          .map(({ os_months, os_status }) => ({ os_months, os_status })),
      }))
      .reduce((prev, curr) => {
        const groupName = Object.keys(curr)[0];
        return [
          ...prev,
          ...curr[groupName].map((d) => ({
            group: parseInt(groupName) + 1,
            os_months: d.os_months,
            os_status: d.os_status,
          })),
        ];
      }, []);

    try {
      const response = await axios.post('api/r', {
        fn: 'survival',
        args: survivalData,
      });

      return response.data.output;
    } catch (error) {
      console.log(error);
      return '';
    }
  },
});
