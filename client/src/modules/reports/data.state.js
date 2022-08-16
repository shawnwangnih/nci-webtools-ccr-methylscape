import { atom, selector } from "recoil";
import axios from "axios";

export const defaultDataState = {
  data: [],
  experimentData: [],
  sampleData: [],
  projectsCount: 0,
  experimentsCount: 0,
  samplesCount: 0,
};

export const dataState = atom({ key: "appState", default: defaultDataState });

export const methylscapeData = selector({
  key: "methylscapeData",
  get: async (_) => {
    try {
   
      const newResponse = await axios.get("/api/analysis/newsamples");
      const experimentRes = await axios.get("/api/analysis/experiment");
      const sampleRes = await axios.get("/api/analysis/allsample");


      const data = newResponse.data;
      const experimentData = experimentRes.data;
      const sampleData = sampleRes.data;
      const projectsCount = data.length;//[...new Set(data.filter(({ project }) => project).map(({ project }) => project))].length;
      const experimentsCount = experimentData.length;
      const samplesCount=sampleData.length;

      return {
        data,
        experimentData,
        sampleData,
        projectsCount,
        experimentsCount,
        samplesCount,
      };
    } catch (err) {
      console.log(err);
      return defaultDataState;
    }
  },
});
