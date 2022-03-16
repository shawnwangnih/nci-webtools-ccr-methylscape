import { atom, selector } from 'recoil';
import axios from 'axios';

export const defaultFormState = {
  annotation: 'none',
  significant: true,
  search: [],
};

export const formState = atom({
  key: 'copynumber.formState',
  default: defaultFormState,
});

export const defaultCopyNumberState = {
  idatFilename: '',
  sample: '',
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
  key: 'copyNumberPlotState',
  get: async ({ get }) => {
    const { idatFilename, sample } = get(copyNumberState);
    const { annotation, search, significant } = get(formState);

    if (!idatFilename) return defaultPlotState;
    try {
      const response = await axios.post('api/getCopyNumber', {
        id: idatFilename,
        search: search.map(({ value }) => value),
        annotation,
        significant,
      });

      const { data, layout, config, ...rest } = response.data;

      return {
        data,
        config,
        layout: {
          ...layout,
          uirevision: idatFilename + annotation + search + significant,
          title: `${sample} (${idatFilename})`,
        },
        ...rest,
      };
    } catch (error) {
      console.log(error);
      return { error: 'Copy Number not found' };
    }
  },
});
