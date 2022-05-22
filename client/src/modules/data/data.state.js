import { atom, selector } from 'recoil';
import axios from 'axios';

export const defaultDataState = {
  data: [],
  projectsCount: 0,
  experimentsCount: 0,
  samplesCount: 0,
};

export const dataState = atom({ key: 'appState', default: defaultDataState });

export const methylscapeData = selector({
  key: 'methylscapeData',
  get: async (_) => {
    try {
      const response = await axios.get('/api/projects/scanDynamoDB');
      const data = response.data;

      const projectsCount = [
        ...new Set(
          data.filter(({ project }) => project).map(({ project }) => project)
        ),
      ].length;
      const experimentsCount = [
        ...new Set(
          data
            .filter(({ experiment }) => experiment)
            .map(({ experiment }) => experiment)
        ),
      ].length;
      const samplesCount = [
        ...new Set(
          data
            .filter(({ sample_name }) => sample_name)
            .map(({ sample_name }) => sample_name)
        ),
      ].length;

      return {
        data,
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
