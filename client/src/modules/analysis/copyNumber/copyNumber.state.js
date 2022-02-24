import { atom, selector } from 'recoil';
import { query } from '../../../services/query';

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

      const tableProps = await (
        await fetch('api/getCopyNumber', options)
      ).json();

      return tableProps;
    } catch (error) {
      console.log(error);
      return { error: 'Unavailable' };
    }
  },
});
