import { atom } from 'recoil';

export const defaultTableState = {
  points: [],
};

export const tableState = atom({
  key: 'umapTableState',
  default: defaultTableState,
});
