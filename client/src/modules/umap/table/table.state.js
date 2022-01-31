import { atom, selector } from 'recoil';
import axios from 'axios';

export const defaultSelectedPoints = {
  points: [],
};

export const selectedPoints = atom({
  key: 'umapSelectedPoints',
  default: defaultSelectedPoints,
});

export const tableData = selector({
  key: 'umapSelectedTable',
  get: ({ get }) => {
    const { points } = get(selectedPoints);
    if (!points.length) return { data: [], cols: [] };

    const cols = points.length
      ? Object.keys(points[0].customdata).map((e) => ({
          id: e,
          accessor: e,
          Header: e,
        }))
      : [];

    const data = points.map((e) => e.customdata);

    return { data, cols };
  },
});

export const survivalPlot = selector({
  key: 'survivalPlot',
  get: async ({ get }) => {
    const { points } = get(selectedPoints);

    if (!points.length) return '';

    const survivalData = points
      .map((e) => e.customdata)
      .filter(
        ({ os_months, os_status }) => os_months && os_status && os_status > -1
      );
    const os_months = survivalData.map(({ os_months }) => os_months);
    const os_status = survivalData.map(({ os_status }) => os_status);

    try {
      const response = await axios.post('api/r', {
        fn: 'survival',
        args: { os_months, os_status },
      });

      return response.data.output;
    } catch (error) {
      console.log(error);
      return '';
    }
  },
});
