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
      table.string("idatFilename");
      table.string("primaryCategory");
      table.string("primaryStudy");
      table.string("centerMethylation");
      table.string("matchedCases");
      table.string("v11b6");
      table.string("nihLabels");
      table.string("nciMetric");
      table.double("age");
      table.string("sexCongruency");
      table.string("sexPrediction");
      table.string("histology");
      table.string("locationGeneral");
      table.string("locationSpecific");
      table.string("subtypeOrPattern");
      table.string("details");
      table.string("h3k27me3");
      table.text("variants");
      table.string("fusionsOrTranslocations");
      table.string("variantsReport");
      table.string("fusionsOrTranslocationsReport");
      table.double("overallSurvivalMonths");
      table.integer("overallSurvivalStatus");
      table.string('who_2007_grade');
      table.string('sampling');
      table.string('samplingTreatment');
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
      table.date("importDate");
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
      table.string("sample");
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
      table.increments('id');
      table.string('chr').index();
      table.integer('start').index();
      table.integer('end').index();
      table.string('geneId');
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
   * Example resources: *, 'user:1', etc
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

