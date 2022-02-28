import { atom, selector } from 'recoil';
import { query } from '../../../services/query';

export const defaultFormState = {
  annotation: 'none',
  search: [],
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
    const { annotation, search } = get(formState);

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
          search,
          annotation,
        }),
      };

      const { data, layout, config } = await (
        await fetch('api/getCopyNumber', options)
      ).json();

      return {
        data,
        config,
        layout: { ...layout, uirevision: idatFilename + annotation + search },
      };
    } catch (error) {
      console.log(error);
      return { error: 'Unavailable' };
    }
  },
});
