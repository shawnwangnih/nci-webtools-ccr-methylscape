import { atom, selector } from "recoil";
import { methylscapeData } from "../data.state";

export const defaultProjectState = {
  selectedProject: "",
};

export const projectState = atom({
  key: "projectState",
  default: defaultProjectState,
});

export const projectsTableData = selector({
  key: "projectsTableData",
  get: ({ get }) => {
    const { data } = get(methylscapeData);

    if (!data.length) return [];

    return Object.values(data);
  },
});

export const selectedRow = selector({
  key: "selectedProject",
  get: ({ get }) => {
    const { selectedProject } = get(projectState);
    if (!selectedProject) return false;

    let { sampleData } = get(methylscapeData);
    let data = sampleData.filter(({ project }) => project == selectedProject);

    const getMethylationClasses = () => {
      let cur = {};
      let pieData = [];
      data.forEach((row) => {
        if (row.classifier_prediction != null) {
          if (Object.keys(row.classifier_prediction).length >= 2) {
            Object.keys(row.classifier_prediction).forEach((key) => {
              if (key != "0") {
                Object.keys(row.classifier_prediction[key]).forEach((key1) => {
                  cur[key1] = cur[key1] + 1 || 1;
                });
              }
            });
          } else {
            Object.values(row.classifier_prediction).forEach((cp) => {
              Object.keys(cp).forEach((key) => {
                cur[key] = cur[key] + 1 || 1;
              });
            });
          }
        }
      });
      Object.keys(cur).forEach((k) => {
        // pieData.push({label:k, value:cur[k]})
        pieData.push([k.replace("methylation class ", ""), cur[k]]);
        //pieData[0].push(k.replace('methylation class ', ''));
        //pieData[1].push(cur[k]);
      });
      return pieData;
    };

    const getGender = () => {
      let cur = {};
      let pieData = [];
      data.forEach((row) => {
        cur[row.gender] = cur[row.gender] + 1 || 1;
      });
      Object.keys(cur).forEach((k) => {
        pieData.push([k, cur[k]]);
        //pieData[0].push(k);
        //pieData[1].push(cur[k]);
      });
      return pieData;
    };

    const getAgeDistribution = () => {
      let cur = {};
      let pieData = [];
      data.forEach((row) => {
        cur[row.age] = cur[row.age] + 1 || 1;
      });
      Object.keys(cur).forEach((k) => {
        pieData.push([k, cur[k]]);
      });
      return pieData;
    };

    const methylationClasses = getMethylationClasses();
    const gender = getGender();
    const ageDistribution = getAgeDistribution();

    return { selectedProject, methylationClasses, gender, ageDistribution };
  },
});
