async function getSamples(connection, { embedding, organSystem }) {
  if (embedding && organSystem) {
    return await connection('sample')
      .join('sampleCoordinates', 'sample.id', 'sampleCoordinates.sampleId')
      .where('sampleCoordinates.embedding', embedding)
      .andWhere('sampleCoordinates.organSystem', organSystem);
  } else {
    return [];
  }
}

async function getAnnotations(connection, query) {
  return await connection('annotations').select('*').whereIn('mapInfo', query);
}

module.exports = {
  getSamples,
  getAnnotations,
};
