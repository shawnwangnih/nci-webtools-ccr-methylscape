async function getSampleCoordinates(connection, query) {
  if (query.embedding && query.organSystem) {
    return await connection("sample")
      .join("sampleCoordinate", "sample.idatFilename", "sampleCoordinate.sampleIdatFilename")
      .where("sampleCoordinate.embedding", query.embedding)
      .andWhere("sampleCoordinate.organSystem", query.organSystem);
  } else {
    return [];
  }
}

async function getSamples(connection, query) {
  const { columns, conditions, offset, limit, orderBy } = query;

  let sqlQuery = await connection("sample")
    .select(columns || "*")
    .offset(offset || 0)
    .limit(limit || 10000)
    .orderBy(orderBy || "id");

  for (let condition of conditions || []) {
    sqlQuery = sqlQuery.where(...condition);
  }

  return await sqlQuery;
}

async function getCnvBins(connection, { idatFilename }) {
  if (idatFilename) {
    const [geneCountResult] = await connection("cnvBin")
      .count("gene", { as: "count" })
      .whereNotNull("gene")
      .andWhere("sampleIdatFilename", idatFilename);

    if (+geneCountResult.count === 0) {
      await connection.raw("call mapBinsToGenes(?)", [idatFilename]);
    }

    const cnvBins = await connection("cnvBin").where("sampleIdatFilename", idatFilename);

    return cnvBins.map((cnvBin) => ({
      ...cnvBin,
      gene: cnvBin.gene ? cnvBin.gene.split(";") : [],
    }));
  } else {
    return [];
  }
}

async function getCnvSegments(connection, { idatFilename }) {
  if (idatFilename) {
    return await connection("cnvSegment").where("sampleIdatFilename", idatFilename);
  } else {
    return [];
  }
}

async function getGenes(connection) {
  return await connection("gene").select("*");
}

async function getImportLogs(connection, query) {
  if (query.id) {
    return await connection("importLog").select("*").where("id", query.id);
  } else {
    return await connection("importLog")
      .select("id", "status", "warnings", "createdAt", "updatedAt")
      .orderBy("createdAt", "desc");
  }
}

module.exports = {
  getGenes,
  getSamples,
  getSampleCoordinates,
  getCnvBins,
  getCnvSegments,
  getImportLogs,
};
