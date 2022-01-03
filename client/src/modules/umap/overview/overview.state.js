import { selector } from 'recoil';
import { formState } from '../metadata/metadata-plot.state';
import { query } from '../../../services/query';

export const defaultOverviewState = {
  samples: 0,
  studies: 0,
  institutions: 0,
  plot: { data: [], layout: {}, config: {} },
};

export const overviewState = selector({
  key: 'overviewState',
  get: async ({ get }) => {
    const { organSystem, embedding } = get(formState);

    if (!organSystem || !embedding) return defaultOverviewState;

    const { records: data } = await query('api/query', {
      table: 'annotation',
      _organSystem: organSystem,
      _embedding: embedding,
      limit: -1,
      columns: [
        'organSystem',
        'embedding',
        'class',
        'label',
        'x',
        'y',
        'study',
        'institution',
        'category',
        'matched',
      ],
    });

    const samples = data.filter((v) => v.category && v.matched != 'Duplicate');
    const studies = [
      ...new Set(
        samples.filter(({ study }) => study).map(({ study }) => study)
      ),
    ].length;
    const institutions = [
      ...new Set(
        samples
          .filter(({ institution }) => institution)
          .map(({ institution }) => institution)
      ),
    ].length;

    return { samples: samples.length, studies, institutions };
  },
});
