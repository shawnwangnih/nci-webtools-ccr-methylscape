import { atom, selector } from 'recoil';

export const defaultDataState = {
  data: [],
  projectsCount: 0,
  experimentsCount: 0,
  samplesCount: 0,
};

export const dataState = atom({ key: 'appState', default: defaultDataState });

export const methylscapeData = selector({
  key: 'methylscapeData',
  get: ({ get }) => get(dataState).data,
});
