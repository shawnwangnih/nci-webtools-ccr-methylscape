import { selector } from "recoil";
import { methylscapeData } from "../data/data.state";

export const samplesTableData = selector({
  key: "samplesTableData",
  get: ({ get }) => {
    const dbData = get(methylscapeData);

    if (!dbData.length) return [];

    //returns the methylation family if it exists
    function getMF(data) {
      return Object.keys(data).length >= 2
        ? String(Object.keys(data["0"])[0]).substring(25)
        : "";
    }

    //returns the methylation family score if it exists
    function getMFScore(data) {
      return Object.values(data).length >= 2 ? Object.values(data["0"]) : "";
    }

    //returns the methylation class
    function getMC(data) {
      const size = Object.keys(data).length;
      if (size >= 2) {
        return Object.keys(data["1"])[0];
      } else if (size === 1) {
        return Object.keys(data["0"])[0];
      } else {
        return "";
      }
    }

    //returns the methylation class score
    function getMCScore(data) {
      const size = Object.keys(data).length;
      if (size >= 2) {
        return Object.values(data["1"])[0];
      } else if (size === 1) {
        return Object.values(data["0"])[0];
      } else {
        return "";
      }
    }

    const samples = dbData
      .filter(({ sample_name }) => sample_name)
      .map((sample) => {
        const cp = sample.classifier_prediction;
        if (!cp) {
          return {
            ...sample,
            family: "",
            family_score: "",
            class: "",
            class_score: "",
          };
        } else {
          return {
            ...sample,
            family: getMF(cp),
            family_score: getMFScore(cp),
            class: getMC(cp),
            class_score: getMCScore(cp),
          };
        }
      });

    return Object.values(samples);
  },
});
