import { atom } from "recoil";

export const defaultTableState = {
  tableData: [],
};

export const tableState = atom({
  key: "experimentsTableState",
  default: defaultTableState,
});
