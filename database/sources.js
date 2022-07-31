import {
  ageFormatter,
  chromosomeFormatter,
  invalidNumberFormatter,
  patternExtractionFormatter,
  unparsedColonNumericValueFormatter,
} from "./services/formatters.js";

export const sources = [
  {
    sourcePath: "Sample_sheet_master.xlsx",
    table: "sample",
    description: "master sample metadata",
    columns: [
      { sourceName: "Sample", name: "sample" },
      { sourceName: "idat_filename", name: "idatFilename" },
      { sourceName: "Sentrix_ID", name: "sentrixId" },
      { sourceName: "NIH_labels", name: "nihLabels" },
      { sourceName: "NCI_METRIC", name: "nciMetric" },
      { sourceName: "v11b6", name: "v11b6" },
      { sourceName: "Age", formatter: ageFormatter, name: "age" },
      { sourceName: "Sex", name: "sex" },
      { sourceName: "Diagnosis.provided", name: "diagnosisProvided" },
      { sourceName: "Location_region", name: "locationRegion" },
      { sourceName: "Location_site", name: "locationSite" },
      { sourceName: "Additional.info", name: "additionalInfo" },
      { sourceName: "Variants", name: "variants" },
      { sourceName: "Fusions/translocations", name: "fusionsOrTranslocations" },
      { sourceName: "Assay", name: "assay" },
      { sourceName: "Variants_report", name: "variantsReport" },
      { sourceName: "Fusions/translocations_report", name: "fusionsOrTranslocationsReport" },
      { sourceName: "Outside.assay", name: "outsideAssay" },
      { sourceName: "Variants_format", name: "variantsFormat" },
      { sourceName: "Fuions/tranlocations_format", name: "fusionsOrTranslocationsFormat" },
      { sourceName: "LP.CP.Number", name: "lpCpNumber" },
      { sourceName: "Subtype/pattern", name: "subtypeOrPattern" },
      { sourceName: "WHO_2007_grade", name: "who2007Grade" },
      { sourceName: "MCF1_v11b6", name: "MCF1_v11b6" },
      { sourceName: "MCF1_v11b6_score", name: "MCF1_v11b6_score", formatter: invalidNumberFormatter },
      { sourceName: "SC1_v11b6", name: "SC1_v11b6" },
      { sourceName: "SC1_v11b6_score", name: "SC1_v11b6_score", formatter: invalidNumberFormatter },
      { sourceName: "GSM_accession", name: "gsmAccession" },
      { sourceName: "dkfz_brain_tumor_classifier", name: "dkfzBrainTumorClassifier" },
      { sourceName: "Primary_study", name: "primaryStudy" },
      { sourceName: "Center_methy", name: "centerMethylation" },
      { sourceName: "Accession_methy", name: "accessionMethylation" },
      { sourceName: "Sampling_treatment", name: "samplingTreatment" },
      { sourceName: "Location_metastasis", name: "locationMetastasis" },
      { sourceName: "Type", name: "type" },
      { sourceName: "Category", name: "category" },
      { sourceName: "Diagnosis.(tier.1)", name: "diagnosisTier1" },
      { sourceName: "Diagnosis.(tier.2)", name: "diagnosisTier2" },
      { sourceName: "Diagnosis.(tier.3)", name: "diagnosisTier3" },
      { sourceName: "WHO.diagnosis.(tier.4)", name: "whoDiagnosisTier4" },
      { sourceName: "RFpurity.ABSOLUTE", name: "rfPurityAbsolute", formatter: invalidNumberFormatter },
      { sourceName: "RFpurity.ESTIMATE", name: "rfPurityEstimate", formatter: invalidNumberFormatter },
      { sourceName: "LUMP", name: "lump", formatter: invalidNumberFormatter },
      { sourceName: "MCF", name: "mcf", formatter: patternExtractionFormatter(/^(.*):/, true) },
      {
        sourceName: "MCF.score",
        name: "mcfScore",
        formatter: (value, record) => unparsedColonNumericValueFormatter(value, record, "MCF"),
      },
      { sourceName: "Subclass", name: "subclass", formatter: patternExtractionFormatter(/^(.*):/, true) },
      {
        sourceName: "Subclass.score",
        name: "subclassScore",
        formatter: (value, record) => unparsedColonNumericValueFormatter(value, record, "Subclass"),
      },
      { sourceName: "CNSv12b6", name: "CNSv12b6" },
      { sourceName: "CNSv12b6.score", name: "CNSv12b6_score" },
      { sourceName: "CNSv12b6.superfamily", name: "CNSv12b6_superfamily" },
      { sourceName: "CNSv12b6.superfamily.score", name: "CNSv12b6_superfamily_score" },
      { sourceName: "CNSv12b6.family", name: "CNSv12b6_family" },
      { sourceName: "CNSv12b6.family.score", name: "CNSv12b6_family_score" },
      { sourceName: "CNSv12b6.class", name: "CNSv12b6_class" },
      { sourceName: "CNSv12b6.class.score", name: "CNSv12b6_class_score" },
      { sourceName: "CNSv12b6.subclass1", name: "CNSv12b6_subclass1" },
      { sourceName: "CNSv12b6.subclass1.score", name: "CNSv12b6_subclass1_score" },
      { sourceName: "CNSv12b6.subclass2", name: "CNSv12b6_subclass2" },
      { sourceName: "CNSv12b6.subclass2.score", name: "CNSv12b6_subclass2_score" },
      { sourceName: "MGMT.Status", name: "mgmtStatus" },
      { sourceName: "MGMT.Estimated", name: "mgmtEstimated" },
      { sourceName: "SARv12b6", name: "SARv12b6" },
      { sourceName: "SARv12b6.desc", name: "SARv12b6_desc" },
      { sourceName: "SARv12b6.score", name: "SARv12b6_score" },
      { sourceName: "SARv12b6.second", name: "SARv12b6_second" },
      { sourceName: "SARv12b6.second.desc", name: "SARv12b6_second_desc" },
      { sourceName: "SARv12b6.second.score", name: "SARv12b6_second_score" },
      { sourceName: "SARv12b6.third", name: "SARv12b6_third" },
      { sourceName: "SARv12b6.third.desc", name: "SARv12b6_third_desc" },
      { sourceName: "SARv12b6.third.score", name: "SARv12b6_third_score" },
      { sourceName: "OS_months", name: "overallSurvivalMonths", formatter: invalidNumberFormatter },
      { sourceName: "OS_status", name: "overallSurvivalStatus", formatter: invalidNumberFormatter },
      { sourceName: "Batch_date", name: "batchDate" },
    ],
  },

  {
    sourcePath: "anno_neuro.txt",
    table: "sampleCoordinate",
    description: "umap coordinates - centralNervousSystem",
    columns: [
      { sourceName: "idat_filename", name: "sampleIdatFilename" },
      { sourceName: null, name: "organSystem", defaultValue: "centralNervousSystem" },
      { sourceName: null, name: "embedding", defaultValue: "umap" },
      { sourceName: "umap_x", name: "x" },
      { sourceName: "umap_y", name: "y" },
    ],
  },

  {
    sourcePath: "anno_neuro.txt",
    table: "sampleCoordinate",
    description: "densmap coordinates - centralNervousSystem",
    columns: [
      { sourceName: "idat_filename", name: "sampleIdatFilename" },
      {
        sourceName: null,
        name: "organSystem",
        defaultValue: "centralNervousSystem",
      },
      { sourceName: null, name: "embedding", defaultValue: "densmap" },
      { sourceName: "densmap_x", name: "x" },
      { sourceName: "densmap_y", name: "y" },
    ],
  },

  {
    sourcePath: "anno_sarcoma.txt",
    table: "sampleCoordinate",
    description: "umap coordinates - boneAndSoftTissue",
    columns: [
      { sourceName: "idat_filename", name: "sampleIdatFilename" },
      {
        sourceName: null,
        name: "organSystem",
        defaultValue: "boneAndSoftTissue",
      },
      { sourceName: null, name: "embedding", defaultValue: "umap" },
      { sourceName: "umap_x", name: "x" },
      { sourceName: "umap_y", name: "y" },
    ],
  },

  {
    sourcePath: "anno_sarcoma.txt",
    table: "sampleCoordinate",
    description: "densmap coordinates - boneAndSoftTissue",
    columns: [
      { sourceName: "idat_filename", name: "sampleIdatFilename" },
      {
        sourceName: null,
        name: "organSystem",
        defaultValue: "boneAndSoftTissue",
      },
      { sourceName: null, name: "embedding", defaultValue: "densmap" },
      { sourceName: "densmap_x", name: "x" },
      { sourceName: "densmap_y", name: "y" },
    ],
  },

  {
    sourcePath: "anno_heme.txt",
    table: "sampleCoordinate",
    description: "umap coordinates - hematopoietic",
    columns: [
      { sourceName: "idat_filename", name: "sampleIdatFilename" },
      {
        sourceName: null,
        name: "organSystem",
        defaultValue: "hematopoietic",
      },
      { sourceName: null, name: "embedding", defaultValue: "umap" },
      { sourceName: "umap_x", name: "x" },
      { sourceName: "umap_y", name: "y" },
    ],
  },

  {
    sourcePath: "anno_heme.txt",
    table: "sampleCoordinate",
    description: "densmap coordinates - hematopoietic",
    columns: [
      { sourceName: "idat_filename", name: "sampleIdatFilename" },
      {
        sourceName: null,
        name: "organSystem",
        defaultValue: "hematopoietic",
      },
      { sourceName: null, name: "embedding", defaultValue: "densmap" },
      { sourceName: "densmap_x", name: "x" },
      { sourceName: "densmap_y", name: "y" },
    ],
  },

  {
    sourcePath: "anno_kidney.txt",
    table: "sampleCoordinate",
    description: "umap coordinates - renal",
    columns: [
      { sourceName: "idat_filename", name: "sampleIdatFilename" },
      { sourceName: null, name: "organSystem", defaultValue: "renal" },
      { sourceName: null, name: "embedding", defaultValue: "umap" },
      { sourceName: "umap_x", name: "x" },
      { sourceName: "umap_y", name: "y" },
    ],
  },

  {
    sourcePath: "anno_kidney.txt",
    table: "sampleCoordinate",
    description: "densmap coordinates - renal",
    columns: [
      { sourceName: "idat_filename", name: "sampleIdatFilename" },
      { sourceName: null, name: "organSystem", defaultValue: "renal" },
      { sourceName: null, name: "embedding", defaultValue: "densmap" },
      { sourceName: "densmap_x", name: "x" },
      { sourceName: "densmap_y", name: "y" },
    ],
  },

  {
    sourcePath: "anno_pan.txt",
    table: "sampleCoordinate",
    description: "umap coordinates - panCancer",
    columns: [
      { sourceName: "idat_filename", name: "sampleIdatFilename" },
      { sourceName: null, name: "organSystem", defaultValue: "panCancer" },
      { sourceName: null, name: "embedding", defaultValue: "umap" },
      { sourceName: "umap_x", name: "x" },
      { sourceName: "umap_y", name: "y" },
    ],
  },

  {
    sourcePath: "anno_pan.txt",
    table: "sampleCoordinate",
    description: "densmap coordinates - panCancer",
    columns: [
      { sourceName: "idat_filename", name: "sampleIdatFilename" },
      { sourceName: null, name: "organSystem", defaultValue: "panCancer" },
      { sourceName: null, name: "embedding", defaultValue: "densmap" },
      { sourceName: "densmap_x", name: "x" },
      { sourceName: "densmap_y", name: "y" },
    ],
  },
  {
    sourcePath: "genes.csv",
    table: "gene",
    description: "Genes",
    columns: [
      { sourceName: "name", name: "name" },
      { sourceName: "chromosome", name: "chromosome" },
      { sourceName: "start", name: "start" },
      { sourceName: "end", name: "end" },
    ],
  },
  {
    sourcePath: "CNV/segments/",
    type: "folder",
    table: "cnvSegment",
    description: "CNV segments",
    parseConfig: {
      columns: ["Index", "ID", "chrom", "loc.start", "loc.end", "num.mark", "bstat", "pval", "seg.mean", "seg.median"],
      from_line: 2,
    },
    columns: [
      { sourceName: "ID", name: "sampleIdatFilename" },
      { sourceName: "chrom", name: "chromosome", formatter: chromosomeFormatter },
      { sourceName: "loc.start", name: "start" },
      { sourceName: "loc.end", name: "end" },
      { sourceName: "num.mark", name: "numberOfMarkers" },
      { sourceName: "bstat", name: "bStatistic" },
      { sourceName: "pval", name: "pValue" },
      { sourceName: "seg.mean", name: "meanValue" },
      { sourceName: "seg.median", name: "medianValue" },
    ],
    skipImport: async (connection) => {
      const recordKey = "sampleIdatFilename";
      const records = await connection("cnvSegment").select(recordKey).pluck(recordKey).distinct();
      const recordMap = Object.fromEntries(records.map((r) => [r, true]));

      return (metadata) => {
        const sampleIdatFormatter = patternExtractionFormatter(/^(.*)\.seg\.txt$/);
        const sampleIdatFilename = sampleIdatFormatter(metadata.filename);
        return recordMap[sampleIdatFilename];
      };
    },
  },
  {
    sourcePath: "CNV/bins/",
    type: "folder",
    table: "cnvBin",
    description: "CNV bins",
    parseConfig: {
      columns: ["Index", "Chromosome", "Start", "End", "Feature", "MedianLogIntensity"],
      from_line: 2,
    },
    columns: [
      {
        sourceMetadataName: "filename",
        name: "sampleIdatFilename",
        formatter: patternExtractionFormatter(/^(.*)\.bins\.txt$/),
      },
      { sourceName: "Chromosome", name: "chromosome", formatter: chromosomeFormatter },
      { sourceName: "Start", name: "start" },
      { sourceName: "End", name: "end" },
      { sourceName: "Feature", name: "feature" },
      { sourceName: "MedianLogIntensity", name: "medianValue" },
    ],
    skipImport: async (connection) => {
      const recordKey = "sampleIdatFilename";
      const records = await connection("cnvBin").select(recordKey).pluck(recordKey).distinct();
      const recordMap = Object.fromEntries(records.map((r) => [r, true]));

      return (metadata) => {
        const sampleIdatFormatter = patternExtractionFormatter(/^(.*)\.bins\.txt$/);
        const sampleIdatFilename = sampleIdatFormatter(metadata.filename);
        return recordMap[sampleIdatFilename];
      };
    },
  },
  {
    type: "postImport",
    description: "Map CNV bins to genes",
    callback: async (connection) => {
      await connection.raw('analyse "cnvBin"');
      await connection.raw("call mapAllBinsToGenes()");
      return `Mapped CNV bins to genes`;
    },
  },
];

export default sources;
