import { selector } from "recoil";
import { methylscapeData } from "../data.state";

export const experimentsTableData = selector({
  key: "experimentsTableData",
  get: ({ get }) => {
    const { experimentData } = get(methylscapeData);

    if (!experimentData.length) return [];



    return Object.values(experimentData);
  },
});
