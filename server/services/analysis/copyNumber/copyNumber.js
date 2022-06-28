const { getKey, getAnalysisFile } = require("../../aws");
const { groupBy, chunk } = require("lodash");
const Papa = require("papaparse");
const { aws: awsConfig } = require("../../../config");

async function parseTSV(stream, options = {}) {
  return new Promise((resolve, reject) => {
    let data = [];
    const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
      ...options,
      header: true,
    });
    stream.pipe(parseStream);
    parseStream.on("error", (e) => {
      reject(e);
    });
    parseStream.on("data", (d) => {
      data.push(d);
    });
    parseStream.on("end", () => {
      resolve(data);
    });
  });
}

async function getCopyNumber(request) {
  const { id, search, annotation, significant } = request.body;
  const { connection } = request.app.locals;
  const keyPrefix = awsConfig.s3AnalysisKey || "methylscape/analysis";

  // find and parse files
  const binFind = await getKey(keyPrefix + "CNV/bins/" + id);
  const binKey = binFind.Contents[0].Key;

  // const probeFind = await getKey(keyPrefix + 'CNV/probes/' + id);
  // const probeKey = probeFind.Contents[0].Key;

  const segFind = await getKey(keyPrefix + "CNV/segments/" + id);
  const segKey = segFind.Contents[0].Key;

  const binFile = await getAnalysisFile(binKey);
  // const probeFile = await getAnalysisFile(probeKey);
  const segFile = await getAnalysisFile(segKey);

  // fix for files that contain an extra column that is not defined
  const parseFixDimensions = {
    beforeFirstChunk: (chunk) => {
      let lines = chunk.split(/\r\n|\r|\n/);
      lines[0] = "row\t" + lines[0];
      return lines.join("\n");
    },
  };

  const bin = await parseTSV(binFile.Body, parseFixDimensions);
  // const probe = await parseTSV(probeFile.Body, parseFixDimensions);
  const seg = await parseTSV(segFile.Body, parseFixDimensions);

  // get chromosome as index from string
  function getChr(chr) {
    return parseInt(chr.includes("X") ? 23 : chr.includes("Y") ? 24 : chr.replace(/^chr/, ""));
  }

  // const probesByChr = groupBy(
  //   probe.map((d) => ({
  //     start: d.Start,
  //     end: d.End,
  //     feature: d.Feature,
  //     chr: d.Chromosome,
  //   })),
  //   (e) => e.chr
  // );

  // function getProbes(chr, start, end) {
  //   const probes = probesByChr[chr]
  //     .filter((e) => e.start >= start && e.end <= end)
  //     .map((e) => e.feature);

  //   console.log(probes.length);

  //   return probes;
  // }

  async function getGenes(chr, start, end) {
    const query = await connection("genes")
      .select("*")
      .where({ chr })
      .andWhere((e) => {
        e.whereBetween("start", [start, end]).orWhereBetween("end", [start, end]);
      });
    return query.map((e) => e.geneId);
  }

  // parse bins
  let bins = bin.map((e) => ({
    ...e,
    position: Math.round((parseInt(e.Start) + parseInt(e.End)) / 2),
    log2ratio: parseFloat(e[Object.keys(e)[Object.keys(e).length - 1]]),
    chr: getChr(e.Chromosome),
  }));

  // get range of position per chromosome
  const binPosOffset = Object.values(
    bins.reduce((a, c) => {
      if (c.chr != 24) {
        if (a[c.chr]) {
          return {
            ...a,
            [c.chr]: Math.max(a[c.chr], c.position),
          };
        } else {
          return {
            ...a,
            [c.chr]: c.position || 0,
          };
        }
      } else return a;
    }, {})
  )
    .reduce((a, c, i) => [...a, c + (a[i - 1] || 0)], [])
    .reduce((a, c, i) => ({ ...a, [i + 2]: c }), { 1: 0 });

  // const segPosOffset = Object.values(
  //   seg.reduce((a, c) => {
  //     const chr = getChr(c.chrom);
  //     if (chr != 24) {
  //       if (a[chr]) {
  //         return {
  //           ...a,
  //           [chr]: Math.max(a[chr], parseInt(c['loc.start'])),
  //         };
  //       } else {
  //         return {
  //           ...a,
  //           [chr]: parseInt(c['loc.start']),
  //         };
  //       }
  //     } else return a;
  //   }, {})
  // )
  //   .reduce((a, c, i) => [...a, c + (a[i - 1] || 0)], [])
  //   .reduce((a, c, i) => ({ ...a, [i + 2]: c }), { 1: 0 });

  // parse segments
  const segments = seg.map((e) => {
    const cnv = (median) => {
      if (median <= -0.6) return "deletion";
      if (median > -0.6 && median <= -0.1) return "loss";
      if (median > 0.1 && median < 0.6) return "gain";
      if (median >= 0.6) return "amplification";
      return "";
    };
    const chr = getChr(e.chrom);

    return {
      // chr: chr,
      // posStart: parseInt(e['loc.start']),
      // posEnd: parseInt(e['loc.end']),
      medianLog2Ratio: parseFloat(e["seg.median"]),
      // CNV: cnv(parseFloat(e['seg.median'])),
      x1: binPosOffset[chr] + parseInt(e["loc.start"]),
      x2: binPosOffset[chr] + parseInt(e["loc.end"]),
      // width: e['loc.end'] - parseInt(e['loc.start']),
      // posStartNew: segPosOffset[chr] + parseInt(e['loc.start']),
      // posEndNew: segPosOffset[chr] + parseInt(e['loc.end']),
    };
  });

  // find min max bin values
  const yMin = bins.reduce((a, c) => (a < c.log2ratio ? a : c.log2ratio));
  const yMax = bins.reduce((a, c) => (a > c.log2ratio ? a : c.log2ratio));

  // filter for significant values: top/bottom 25%
  const significantRange = 0.5;

  if (significant)
    bins = bins.filter((e) => e.log2ratio > yMax * significantRange || e.log2ratio < yMin * significantRange);

  // get annotated genes
  bins = await Promise.all(
    bins.map(async (e) => ({
      ...e,
      genes: [...new Set(await getGenes(e.Chromosome, e.Start, e.End))],
    }))
  );

  return { bins, segments, binPosOffset, yMin, yMax, significantRange };
}

module.exports = { getCopyNumber };
