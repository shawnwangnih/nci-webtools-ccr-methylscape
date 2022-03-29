import { selector } from 'recoil';
import { methylscapeData } from '../data.state';

export const experimentsTableData = selector({
  key: 'experimentsTableData',
  get: ({ get }) => {
    const { data } = get(methylscapeData);

    if (!data.length) return [];

    let experiments = [];
    data.forEach((sample) => {
      const curExperiment = sample.experiment;
      if (curExperiment) {
        if (curExperiment in experiments) {
          experiments[curExperiment].samplesCount += 1;
        } else {
          experiments[curExperiment] = {
            experiment: curExperiment,
            project: sample.project,
            samplesCount: 1,
            date: sample.date,
            investigator: sample.investigator,
          };
        }
      }
    });

    return Object.values(experiments);
  },
});
