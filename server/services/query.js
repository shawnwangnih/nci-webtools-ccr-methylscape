async function getSamples(connection, { embedding, organSystem }) {
  if (embedding && organSystem) {
    return await connection('sample')
      .join('sampleCoordinate', 'sample.idatFilename', 'sampleCoordinate.sampleIdatFilename')
      .where('sampleCoordinate.embedding', embedding)
      .andWhere('sampleCoordinate.organSystem', organSystem);
  } else {
    return [];
  }
}

async function getCnvBins(connection, { idatFilename }) {
  if (idatFilename && /^[A-Z0-9_]+$/i.test(idatFilename)) {
    const tableName = `cnvBin_${idatFilename}`;
    
    const [geneCountResult] = await connection(tableName)
      .count('gene', {as: 'count'})
      .whereNotNull('gene');

    if (+geneCountResult.count === 0) {
      await connection.raw("call mapBinsToGenes('??')", [ tableName ]);
    }

    const cnvBins = await connection(tableName).select('*');
    return cnvBins.map(cnvBin => ({
      ...cnvBin,
      gene: cnvBin.gene ? cnvBin.gene.split(';') : [],
    }));

  } else {
    return [];
  }
}

async function getCnvSegments(connection, { idatFilename }) {
  if (idatFilename) {
    return await connection('cnvSegment')
      .where('sampleIdatFilename', idatFilename);
  } else {
    return [];
  }
}

async function getGenes(connection) {
  return await connection('gene').select('*');
}

async function getImportLogs(connection) {
  return await connection('importLog').select('*').orderBy('createdAt', 'desc');
}

module.exports = {
  getGenes,
  getSamples,
  getCnvBins,
  getCnvSegments,
  getImportLogs,
};
