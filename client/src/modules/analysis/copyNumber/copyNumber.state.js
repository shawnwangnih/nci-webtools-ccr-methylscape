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

export const defaultSelectSample = {
  idatFilename: '',
  sample: '',
};

export const selectSampleState = atom({
  key: 'selectSampleState',
  default: defaultSelectSample,
});

export const defaultPlotState = {
  data: [],
  layout: {},
  config: {},
};

export const plotState = selector({
  key: 'copyNumberPlotState',
  get: async ({ get }) => {
    const { idatFilename, sample } = get(selectSampleState);
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
      console.log(data, layout);
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
