const sources = [
  {
    sourcePath: 'Sample_sheet_master.xlsx',
    table: 'sample',
    description: 'master sample metadata',
    columns: [
      { sourceName: 'nn', name: 'id' },
      { sourceName: 'Sample', name: 'sample' },
      { sourceName: 'idat_filename', name: 'idatFilename' },
      { sourceName: 'Category', name: 'primaryCategory' },
      { sourceName: 'Primary_study', name: 'primaryStudy' },
      { sourceName: 'Center_methy', name: 'centerMethylation' },
      { sourceName: 'matched_cases', name: 'matchedCases' },
      { sourceName: 'v11b6', name: 'v11b6' },
      { sourceName: 'NIH_labels', name: 'nihLabels' },
      { sourceName: 'NCI_METRIC', name: 'nciMetric' },
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
      { sourceName: 'Sex_congruency', name: 'sexCongruency' },
      { sourceName: 'Sex_prediction_minfi', name: 'sexPrediction' },
      { sourceName: null, name: 'histology', defaultValue: null },
      { sourceName: 'Location_region', name: 'locationGeneral' },
      { sourceName: 'Location_site', name: 'locationSpecific' },
      { sourceName: 'Subtype/pattern', name: 'subtypeOrPattern' },
      { sourceName: 'Additional.info', name: 'details' },
      { sourceName: 'H3K27me3', name: 'h3k27me3' },
      { sourceName: 'Variants', name: 'variants' },
      { sourceName: 'Fusions/translocations', name: 'fusionsOrTranslocations' },
      { sourceName: 'Variants_report', name: 'variantsReport' },
      {
        sourceName: 'Fusions/translocations_report',
        name: 'fusionsOrTranslocationsReport',
      },
      { sourceName: 'OS_months', name: 'overallSurvivalMonths' },
      { sourceName: 'OS_status', name: 'overallSurvivalStatus' },
      { sourceName: 'WHO_2007_grade', name: 'who_2007_grade' },
      { sourceName: 'Sampling', name: 'sampling' },
      { sourceName: 'Sampling_treatment', name: 'samplingTreatment' },
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
      { sourceName: 'chrom', name: 'chr' },
      { sourceName: 'chromStart', name: 'start' },
      { sourceName: 'chromEnd', name: 'end' },
      { sourceName: 'geneName', name: 'geneId' },
    ],
  },
];

module.exports = {
  sources,
};
