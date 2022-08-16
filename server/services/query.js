async function getSamples(connection, { embedding, organSystem }) {
  if (embedding && organSystem) {
    return await connection("sample")
      .join("sampleCoordinate", "sample.idatFilename", "sampleCoordinate.sampleIdatFilename")
      .where("sampleCoordinate.embedding", embedding)
      .andWhere("sampleCoordinate.organSystem", organSystem);
  } else {
    return [];
  }
}


async function getNewSamples(connection) {
  const sampleColumns = [
    connection.raw(`"samplePlate" as project`),
    connection.raw(`"piCollaborator" as 	Investigator`),
    connection.raw(`count(distinct "sample") as sampleCount`),
    connection.raw(`count(distinct "sentrixId") as experimentCount`),
  ];
  const query = await connection
    .select(sampleColumns)
    .from('sample')
    .whereNotNull('samplePlate')
    .groupBy('samplePlate')
    .groupBy('piCollaborator')
    .orderBy('samplePlate');
    return query;
}


async function getAllSamples(connection) {
  const sampleColumns = [
    connection.raw(`"samplePlate" as project`),
    connection.raw(`"sample"`),
    connection.raw(`"sentrixId" as experiment`),
    connection.raw(`"sex" as gender`),
    connection.raw(`"age" as age`),
    connection.raw(`"notes"`),
    connection.raw(`"diagnosisProvided" as diagnosis`),
    connection.raw(`"CNSv12b6_family" as mf`),
    connection.raw(`"CNSv12b6_family_score" as mf_calibrated_score`),
    connection.raw(`"CNSv12b6_subclass1" as mc`),
    connection.raw(`"CNSv12b6_subclass1_score" as mc_calibrated_score`),
    connection.raw(`"mgmtStatus" as mgmt_status`),
    connection.raw(`"mgmtEstimated" as tumore_sites`),
    connection.raw(`"batchDate"as sampleDate`),
    connection.raw(`"surgeryDate" as 	experimentDate`),
    connection.raw(`"lpCpNumber"`)

  ];
  const query = await connection
    .select(sampleColumns)
    .from('sample')
    .whereNotNull('samplePlate')

    return query;
}

async function getExperiments(connection) {
  const experimentColumns = [
    connection.raw(`"samplePlate" as project`),
    connection.raw(`"piCollaborator" as 	Investigator`),
    connection.raw(`"surgeryDate" as 	experimentDate`),
    connection.raw(`count(distinct "sample") as sampleCount`),
    connection.raw(`"sentrixId" as experiment`),
  ];
  const query = await connection
    .select(experimentColumns)
    .from('sample')
    .whereNotNull('samplePlate')
    .groupBy('sentrixId')
    .groupBy('piCollaborator')
    .groupBy('surgeryDate')
    .groupBy('samplePlate')
    .orderBy('sentrixId');
    return query;
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

async function getImportLogs(connection) {
  return await connection("importLog").select("*").orderBy("createdAt", "desc");
}

module.exports = {
  getGenes,
  getSamples,
  getCnvBins,
  getCnvSegments,
  getImportLogs,
  getNewSamples,
  getExperiments,
  getAllSamples,
};
