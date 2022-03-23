const sources = [
  {
    sourcePath: 'Sample_sheet_master.xlsx',
    table: 'sample',
    description: 'master sample metadata',
    columns: [
      { sourceName: 'nn', name: 'id' },
      { sourceName: 'Sample', name: 'sample' },
      { sourceName: 'idat_filename', name: 'idatFilename' },
      { sourceName: 'NIH_labels', name: 'nihLabels' },
      { sourceName: 'NCI_METRIC', name: 'nciMetric' },
      { sourceName: 'NCI_GROUP', name: 'nciGroup' },
      { sourceName: 'v11b6', name: 'v11b6' },
      {
        sourceName: 'Age',
        name: 'age',
        formatter: (value) => {
          if (!isNaN(value)) {
            return value;
          } else if (value) {
            const monthMatches = value.match(/(\d+)m/i);
            return monthMatches ? +monthMatches[1] / 12 : null;
          } else {
            return value;
          }
        },
      },
      { sourceName: 'Sex', name: 'sex' },
      { sourceName: 'Diagnosis.provided', name: 'diagnosisProvided' },
      { sourceName: 'Location_region', name: 'locationGeneral' },
      { sourceName: 'Location_site', name: 'locationSpecific' },
      { sourceName: 'Additional.info', name: 'details' },
      { sourceName: 'Variants', name: 'variants' },
      { sourceName: 'Fusions/translocations', name: 'fusionsOrTranslocations' },
      {
        sourceName: 'Fusions/translocations_report',
        name: 'fusionsOrTranslocationsReport',
      },
      { sourceName: 'LP.CP.Number', name: 'lp_cp_number' },
      { sourceName: 'Subtype/pattern', name: 'subtypeOrPattern' },
      { sourceName: 'WHO_2007_grade', name: 'who_2007_grade' },
      { sourceName: 'MCF1_v11b6', name: 'MCF1_v11b6' },
      { sourceName: 'MCF1_v11b6_score', name: 'MCF1_v11b6_score' },
      { sourceName: 'SC1_v11b6', name: 'SC1_v11b6' },
      { sourceName: 'SC1_v11b6_score', name: 'SC1_v11b6_score' },
      { sourceName: 'MCF_v12.3', name: 'MCF_v12.3' },
      { sourceName: 'MCF_v12.3_score', name: 'MCF_v12.3_score' },
      { sourceName: 'MCF_v12.5', name: 'MCF_v12.5' },
      { sourceName: 'MCF_v12.5_score', name: 'MCF_v12.5_score' },
      // { sourceName: 'GSM_accession', name: 'GSM_accession' },
      { sourceName: 'dkfz_brain_tumor_classifier', name: 'dkfzBrainTumorClassifier' },
      { sourceName: 'Primary_study', name: 'primaryStudy' },
      { sourceName: 'Center_methy', name: 'centerMethylation' },
      { sourceName: 'Accession_methy', name: 'accessionMethy' },
      { sourceName: 'Sampling_treatment', name: 'samplingTreatment' },
      { sourceName: 'Location_metastasis', name: 'locationMetastasis' },
      { sourceName: 'Type', name: 'type' },
      { sourceName: 'Category', name: 'primaryCategory' },
      { sourceName: 'Diagnosis.(tier.1)', name: 'diagnosisT1' },
      { sourceName: 'Diagnosis.(tier.2)', name: 'diagnosisT2' },
      { sourceName: 'Diagnosis.(tier.3)', name: 'diagnosisT3' },
      { sourceName: 'WHO.diagnosis.(tier.4)', name: 'who_diagnosisT4' },
      { sourceName: 'Category', name: 'primaryCategory' },

      { sourceName: 'matched_cases', name: 'matchedCases' },
      { sourceName: 'Sex_congruency', name: 'sexCongruency' },
      { sourceName: 'Sex_prediction_minfi', name: 'sexPrediction' },
      { sourceName: 'H3K27me3', name: 'h3k27me3' },
      { sourceName: 'Variants_report', name: 'variantsReport' },
      { sourceName: 'OS_months', name: 'overallSurvivalMonths' },
      { sourceName: 'OS_status', name: 'overallSurvivalStatus' },
      { sourceName: 'Sampling', name: 'sampling' },
    ],
  },

  {
    sourcePath: 'anno_neuro.txt',
    table: 'sampleCoordinates',
    description: 'umap coordinates - centralNervousSystem',
    columns: [
      { sourceName: 'nn', name: 'sampleId' },
      {
        sourceName: null,
        name: 'organSystem',
        defaultValue: 'centralNervousSystem',
      },
      { sourceName: null, name: 'embedding', defaultValue: 'umap' },
      { sourceName: 'umap_x', name: 'x' },
      { sourceName: 'umap_y', name: 'y' },
    ],
  },

  {
    sourcePath: 'anno_neuro.txt',
    table: 'sampleCoordinates',
    description: 'densmap coordinates - centralNervousSystem',
    columns: [
      { sourceName: 'nn', name: 'sampleId' },
      {
        sourceName: null,
        name: 'organSystem',
        defaultValue: 'centralNervousSystem',
      },
      { sourceName: null, name: 'embedding', defaultValue: 'densmap' },
      { sourceName: 'densmap_x', name: 'x' },
      { sourceName: 'densmap_y', name: 'y' },
    ],
  },

  {
    sourcePath: 'anno_sarcoma.txt',
    table: 'sampleCoordinates',
    description: 'umap coordinates - boneAndSoftTissue',
    columns: [
      { sourceName: 'nn', name: 'sampleId' },
      {
        sourceName: null,
        name: 'organSystem',
        defaultValue: 'boneAndSoftTissue',
      },
      { sourceName: null, name: 'embedding', defaultValue: 'umap' },
      { sourceName: 'umap_x', name: 'x' },
      { sourceName: 'umap_y', name: 'y' },
    ],
  },

  {
    sourcePath: 'anno_sarcoma.txt',
    table: 'sampleCoordinates',
    description: 'densmap coordinates - boneAndSoftTissue',
    columns: [
      { sourceName: 'nn', name: 'sampleId' },
      {
        sourceName: null,
        name: 'organSystem',
        defaultValue: 'boneAndSoftTissue',
      },
      { sourceName: null, name: 'embedding', defaultValue: 'densmap' },
      { sourceName: 'densmap_x', name: 'x' },
      { sourceName: 'densmap_y', name: 'y' },
    ],
  },

  {
    sourcePath: 'anno_heme.txt',
    table: 'sampleCoordinates',
    description: 'umap coordinates - hematopoietic',
    columns: [
      { sourceName: 'order', name: 'sampleId' },
      { sourceName: null, name: 'organSystem', defaultValue: 'hematopoietic' },
      { sourceName: null, name: 'embedding', defaultValue: 'umap' },
      { sourceName: 'umap_x', name: 'x' },
      { sourceName: 'umap_y', name: 'y' },
    ],
  },

  {
    sourcePath: 'anno_heme.txt',
    table: 'sampleCoordinates',
    description: 'densmap coordinates - hematopoietic',
    columns: [
      { sourceName: 'order', name: 'sampleId' },
      { sourceName: null, name: 'organSystem', defaultValue: 'hematopoietic' },
      { sourceName: null, name: 'embedding', defaultValue: 'densmap' },
      { sourceName: 'densmap_x', name: 'x' },
      { sourceName: 'densmap_y', name: 'y' },
    ],
  },

  {
    sourcePath: 'anno_kidney.txt',
    table: 'sampleCoordinates',
    description: 'umap coordinates - renal',
    columns: [
      { sourceName: 'nn', name: 'sampleId' },
      { sourceName: null, name: 'organSystem', defaultValue: 'renal' },
      { sourceName: null, name: 'embedding', defaultValue: 'umap' },
      { sourceName: 'umap_x', name: 'x' },
      { sourceName: 'umap_y', name: 'y' },
    ],
  },

  {
    sourcePath: 'anno_kidney.txt',
    table: 'sampleCoordinates',
    description: 'densmap coordinates - renal',
    columns: [
      { sourceName: 'nn', name: 'sampleId' },
      { sourceName: null, name: 'organSystem', defaultValue: 'renal' },
      { sourceName: null, name: 'embedding', defaultValue: 'densmap' },
      { sourceName: 'densmap_x', name: 'x' },
      { sourceName: 'densmap_y', name: 'y' },
    ],
  },

  {
    sourcePath: 'anno_pan.txt',
    table: 'sampleCoordinates',
    description: 'umap coordinates - panCancer',
    columns: [
      { sourceName: 'nn', name: 'sampleId' },
      { sourceName: null, name: 'organSystem', defaultValue: 'panCancer' },
      { sourceName: null, name: 'embedding', defaultValue: 'umap' },
      { sourceName: 'umap_x', name: 'x' },
      { sourceName: 'umap_y', name: 'y' },
    ],
  },

  {
    sourcePath: 'anno_pan.txt',
    table: 'sampleCoordinates',
    description: 'densmap coordinates - panCancer',
    columns: [
      { sourceName: 'nn', name: 'sampleId' },
      { sourceName: null, name: 'organSystem', defaultValue: 'panCancer' },
      { sourceName: null, name: 'embedding', defaultValue: 'densmap' },
      { sourceName: 'densmap_x', name: 'x' },
      { sourceName: 'densmap_y', name: 'y' },
    ],
  },

  // {
  //   sourcePath: 'infinium-methylationepic-v-1-0-b5-manifest-file.csv',
  //   table: 'annotations',
  //   description: 'Gene annotations',
  //   columns: [
  //     { sourceName: 'Name', name: 'name' },
  //     { sourceName: 'CHR', name: 'chr' },
  //     { sourceName: 'MAPINFO', name: 'mapInfo' },
  //     { sourceName: 'UCSC_RefGene_Name', name: 'ucscName' },
  //     { sourceName: 'GencodeBasicV12_NAME', name: 'gencodeBasicV12Name' },
  //     {
  //       sourceName: 'GencodeBasicV12_Accession',
  //       name: 'gencodeBasicV12Accession',
  //     },
  //     {
  //       sourceName: 'Relation_to_UCSC_CpG_Island',
  //       name: 'relationTo_UCSC_CpG_Island',
  //     },
  //   ],
  // },

  {
    sourcePath: 'genes.txt',
    table: 'genes',
    description: 'GenCode annotations',
    columns: [
      { sourceName: '#chrom', name: 'chr' },
      { sourceName: 'chromStart', name: 'start' },
      { sourceName: 'chromEnd', name: 'end' },
      { sourceName: 'geneName', name: 'geneId' },
    ],
  },
];

module.exports = {
  sources,
};
