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

async function getImportLog(connection) {
  return await connection('importLog').select('*').orderBy('createdAt', 'desc');
}

module.exports = {
  getSamples,
  getImportLog,
};
