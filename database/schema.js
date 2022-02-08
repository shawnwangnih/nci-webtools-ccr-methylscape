export async function createSchema(database) {
  /**
   * Note that this will remove all pre-existing tables.
   */
  await database.schema.dropTableIfExists("sampleCoordinates");
  await database.schema.dropTableIfExists("sample");
  await database.schema.dropTableIfExists("rolePolicy");
  await database.schema.dropTableIfExists("userRole");
  await database.schema.dropTableIfExists("role");
  await database.schema.dropTableIfExists("user");

  /**
   * Derived from Sample_sheet_master.xlsx
   * Contains sample metadata
   */
  await database.schema.createTable("sample", function (table) {
    table.increments("id");
    table.string("sample");
    table.string("idatFilename");
    table.string("primaryCategory");
    table.string("primaryStudy");
    table.string("centerMethylation");
    table.string("nihLabels");
    table.string("nciMetric");
    table.double("age");
    table.string("sexCongruency");
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
  });

  /**
   * Derived from anno_tumors6sets1.RData
   * Contains coordinates for various dimension reduction plots (umap, densmap, etc.)
   */
  await database.schema.createTable("sampleCoordinates", function (table) {
    table.increments("id");
    table.integer("sampleId").references("sample.id");;
    table.string("organSystem");
    table.string("embedding");
    table.double("x");
    table.double("y");
  });

  /**
   * Create the user table.
   * Each user must have a unique name
   */
  await database.schema.createTable("user", function (table) {
    table.increments("id");
    table.string("name").notNullable().unique();
    table.string("firstName");
    table.string("lastName");
    table.string("email");
    table.boolean("active").defaultTo(false);
    table.timestamp("createdAt").defaultTo(database.fn.now());
    table.timestamp("updatedAt").defaultTo(database.fn.now());
  });

  /**
   * Create the role table.
   * Each role must have a unique name
   * Each role can have a description
   * Roles can be associated with any number of users through the userRole table
   */
  await database.schema.createTable("role", function (table) {
    table.increments();
    table.string("name").notNullable().unique();
    table.string("description");
    table.timestamp("createdAt").defaultTo(database.fn.now());
    table.timestamp("updatedAt").defaultTo(database.fn.now());
  });

  /**
   * Creates the userRole table.
   * Maps a user to a role (many-to-many relationship)
   */
  await database.schema.createTable("userRole", function (table) {
    table.increments();
    table.integer("userId").notNullable().references("user.id");
    table.integer("roleId").notNullable().references("role.id");
    table.timestamp("createdAt").defaultTo(database.fn.now());
    table.timestamp("updatedAt").defaultTo(database.fn.now());
  });

  /**
   * Creates the rolePolicy table.
   * Maps a role to policies (each role can have many policies)
   * Each policy defines an action and a resource
   * Example actions: CreateUser, ReadUser, UpdateUser, DeleteUser
   * Example resources: *, 'user:1', etc
   * Application logic determines how to to enforce policies
   * and how to map resources to entities
   */
  await database.schema.createTable("rolePolicy", function (table) {
    table.increments();
    table.integer("roleId").notNullable().references("role.id");
    table.string("action");
    table.string("resource");
    table.timestamp("createdAt").defaultTo(database.fn.now());
    table.timestamp("updatedAt").defaultTo(database.fn.now());
  });
}
