import { atom, selector } from 'recoil';
import axios from 'axios';

export const defaultSelectedPoints = {
  selectedGroup: 'group_1',
  points: {
    group_1: [],
    group_2: [],
    group_3: [],
  },
};

export const selectedPoints = atom({
  key: 'umapSelectedPoints',
  default: defaultSelectedPoints,
});

export const tableData = selector({
  key: 'umapSelectedTable',
  get: ({ get }) => {
    const { points } = get(selectedPoints);

    if (Object.values(points).every((v) => !v.length)) return [];

    const tables = Object.values(points).map((group) => ({
      cols: group.length
        ? Object.keys(group[0].customdata).map((e) => ({
            id: e,
            accessor: e,
            Header: e,
          }))
        : [],
      data: group.map((e) => e.customdata),
    }));

    return tables;
  },
});

export const survivalPlot = selector({
  key: 'survivalPlot',
  get: async ({ get }) => {
    const { points } = get(selectedPoints);

    const filterPoints = Object.fromEntries(
      Object.entries(points).filter(([group, points]) => points.length)
    );
    const groups = Object.keys(filterPoints);
    if (!groups.length) return '';

    const survivalData = Object.entries(filterPoints)
      .map(([group, points]) => ({
        [group]: points
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
            group: groupName,
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
