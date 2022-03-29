export const schema = [

  /**
   * Source: Sample_sheet_master.xlsx
   * Contains sample metadata
   */
  {
    name: "sample",
    import: true,
    schema: (table) => {
      table.increments("id");
      table.string("sample");
      table.string("idatFilename").unique();
      table.string("nihLabels");
      table.string("nciMetric");
      table.string("nciGroup");
      table.string("v11b6");
      table.double("age");
      table.string("sex");
      table.string("diagnosisProvided");
      table.string("locationRegion");
      table.string("locationSite");
      table.string("additionalInfo");
      table.text("variants");
      table.string("fusionsOrTranslocations");
      table.string("assay");
      table.string("variantsReport");
      table.string("fusionsOrTranslocationsReport");
      table.string("outsideAssay");
      table.text("variantsFormat");
      table.string("fusionsOrTranslocationsFormat");
      table.string("lpCpNumber");
      table.string("subtypeOrPattern");
      table.string("who2007Grade");
      table.string("MCF1_v11b6");
      table.string("MCF1_v11b6_score");
      table.string("SC1_v11b6");
      table.string("SC1_v11b6_score");
      table.string("MCF_v12_3");
      table.string("MCF_v12_3_score");
      table.string("MCF_v12_5");
      table.string("MCF_v12_5_score");
      table.string("gsmAccession");
      table.string("dkfzBrainTumorClassifier");
      table.string("primaryStudy");
      table.string("centerMethylation");
      table.string("accessionMethylation");
      table.string("samplingTreatment");
      table.string("locationMetastasis");
      table.string("type");
      table.string("category");
      table.string("diagnosisTier1");
      table.string("diagnosisTier2");
      table.string("diagnosisTier3");
      table.string("whoDiagnosisTier4");
      table.double("overallSurvivalMonths");
      table.integer("overallSurvivalStatus");
      table.date("batchDate");
    }
  },

  /**
   * Sources: anno_<organSystem>.txt
   * Contains coordinates for various dimension reduction plots (umap, densmap, etc.)
   */
  {
    name: "sampleCoordinates",
    import: true,
    schema: (table) => {
      table.increments("id");
      table.integer("sampleId").references("sample.id");
      table.string("organSystem");
      table.string("embedding");
      table.double("x");
      table.double("y");
    }
  },

  /**
   * Sources: Bins/BAF.bins_ <sample>.txt 
   */
  {
    name: "bins",
    import: true,
    schema: (table) => {
      table.increments("id");
      table.integer("sampleId").references("sample.id");
      table.string("sampleIdatFilename").references("sample.idatFilename");
      table.string("chromosome");
      table.integer("start").unsigned();
      table.integer("end").unsigned();
      table.string("feature");
      table.double("value");
    }
  },

  /**
   * Source: genes.csv
   * Genome references for copy number
   */
  {
    name: "genes",
    import: true,
    schema: (table) => {
      table.increments("id");
      table.string("chr").index();
      table.integer("start").index();
      table.integer("end").index();
      table.string("geneId");
    }
  },

  /**
   * Stores import job status logs
   */
  {
    name: "importLog",
    import: false,
    schema: (table, connection) => {
      table.increments("id");
      table.string("status");
      table.text("log");
      table.timestamp("createdAt").defaultTo(connection.fn.now());
      table.timestamp("updatedAt").defaultTo(connection.fn.now());
    }
  },

  /**
   * Create the role table.
   * Each role must have a unique name
   * Each role can have a description
   */
  {
    name: "role",
    import: false,
    schema: (table, connection) => {
      table.increments("id");
      table.string("name").notNullable().unique();
      table.string("description");
      table.timestamp("createdAt").defaultTo(connection.fn.now());
      table.timestamp("updatedAt").defaultTo(connection.fn.now());
    }
  },

  /**
   * Creates the rolePolicy table.
   * Defines policies for each role. 
   * Each policy defines an action and a resource
   * Example actions: CreateUser, ReadUser, UpdateUser, DeleteUser
   * Example resources: *, "user:1", etc
   * Application logic determines how to to enforce policies
   * and how to map resources to entities
   */
  {
    name: "rolePolicy",
    import: false,
    schema: (table, connection) => {
      table.increments("id");
      table.integer("roleId").notNullable().references("role.id");
      table.string("action");
      table.string("resource");
      table.timestamp("createdAt").defaultTo(connection.fn.now());
      table.timestamp("updatedAt").defaultTo(connection.fn.now());
    }
  },

  /**
   * Create the user table.
   * Each user has a unique name and optionally, a role
   */
  {
    name: "user",
    import: false,
    schema: (table, connection) => {
      table.increments("id");
      table.integer("roleId").references("role.id");
      table.string("name").notNullable().unique();
      table.string("firstName");
      table.string("lastName");
      table.string("email");
      table.enum("status", ["pending", "inactive", "active"]).defaultTo("pending");
      table.timestamp("createdAt").defaultTo(connection.fn.now());
      table.timestamp("updatedAt").defaultTo(connection.fn.now());
    }
  },
];

