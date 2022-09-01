export const schema = [
  /**
   * Source: Sample_sheet_master.xlsx
   * Contains sample metadata
   */
  {
    name: "sample",
    recreate: true,
    schema: (table) => {
      table.increments("id");
      table.string("sample");
      table.string("idatFilename").unique();
      table.string("samplePlate");
      table.string("unifiedSamplePlate");
      table.string("piCollaborator");
      table.date("surgeryDate");
      table.string("notes");
      table.bigInteger("sentrixId");
      table.string("sentrixPosition");
      table.string("nihLabels");
      table.string("nciMetric");
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
      table.text("variantsReport");
      table.string("fusionsOrTranslocationsReport");
      table.string("outsideAssay");
      table.text("variantsFormat");
      table.string("fusionsOrTranslocationsFormat");
      table.string("lpCpNumber");
      table.string("subtypeOrPattern");
      table.string("who2007Grade");
      table.string("MCF1_v11b6");
      table.double("MCF1_v11b6_score");
      table.string("SC1_v11b6");
      table.double("SC1_v11b6_score");
      table.string("CNSv12b6");
      table.double("CNSv12b6_score");
      table.string("CNSv12b6_superfamily");
      table.double("CNSv12b6_superfamily_score");
      table.string("CNSv12b6_family");
      table.double("CNSv12b6_family_score");
      table.string("CNSv12b6_class");
      table.double("CNSv12b6_class_score");
      table.string("CNSv12b6_subclass1");
      table.double("CNSv12b6_subclass1_score");
      table.string("CNSv12b6_subclass2");
      table.double("CNSv12b6_subclass2_score");
      table.string("mgmtStatus");
      table.double("mgmtEstimated");
      table.string("SARv12b6");
      table.string("SARv12b6_desc");
      table.double("SARv12b6_score");
      table.string("SARv12b6_second");
      table.string("SARv12b6_second_desc");
      table.double("SARv12b6_second_score");
      table.string("SARv12b6_third");
      table.string("SARv12b6_third_desc");
      table.double("SARv12b6_third_score");
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
      table.double("rfPurityAbsolute");
      table.double("rfPurityEstimate");
      table.double("lump");
      table.string("mcf");
      table.double("mcfScore");
      table.string("subclass");
      table.double("subclassScore");
      table.double("overallSurvivalMonths");
      table.integer("overallSurvivalStatus");
      table.date("batchDate");
    },
  },

  /**
   * Sources: anno_<organSystem>.txt
   * Contains coordinates for various dimension reduction plots (umap, densmap, etc.)
   */
  {
    name: "sampleCoordinate",
    recreate: true,
    schema: (table) => {
      table.increments("id");
      table.string("sampleIdatFilename").index();
      table.string("organSystem").index();
      table.string("embedding").index();
      table.double("x");
      table.double("y");
    },
  },

  /**
   * Source: chromosome.csv
   */
  {
    name: "chromosome",
    recreate: true,
    schema: (table) => {
      table.increments("id");
      table.string("name");
      table.integer("start").index();
      table.integer("centromere");
    },
  },

  /**
   * Source: genes.csv
   * Genome references for copy number
   */
  {
    name: "gene",
    recreate: true,
    schema: (table) => {
      table.increments("id");
      table.integer("chromosome");
      table.integer("start");
      table.integer("end");
      table.string("gene");
      table.index(["chromosome", "start"]);
    },
  },

  /**
   * Sources: CNV/bins/*.txt
   */
  {
    name: "cnvBin",
    recreate: false,
    schema: (table) => {
      table.increments("id");
      table.string("sampleIdatFilename");
      table.integer("chromosome");
      table.integer("start").unsigned();
      table.integer("end").unsigned();
      table.double("pValue");
      table.string("feature");
      table.double("medianValue");
      table.text("gene");
      table.index(["sampleIdatFilename", "chromosome", "start"]);
    },
  },

  /**
   * Sources: CNV/segments/*.txt
   */
  {
    name: "cnvSegment",
    recreate: false,
    schema: (table) => {
      table.increments("id");
      table.string("sampleIdatFilename").index();
      table.integer("chromosome");
      table.integer("start").unsigned();
      table.integer("end").unsigned();
      table.integer("numberOfMarkers");
      table.double("bStatistic");
      table.double("pValue");
      table.double("meanValue");
      table.double("medianValue");
    },
  },

  /**
   * Stores import job status logs
   */
  {
    name: "importLog",
    recreate: true,
    schema: (table, connection) => {
      table.increments("id");
      table.string("status");
      table.string("type").defaultTo("progressive");
      table.text("log");
      table.integer("warnings").defaultTo(0);
      table.timestamp("createdAt").defaultTo(connection.fn.now());
      table.timestamp("updatedAt").defaultTo(connection.fn.now());
      table.string("createdBy").defaultTo("system");
      table.string("updatedBy").defaultTo("system");
    },
  },

  /**
   * Create the role table.
   * Each role must have a unique name
   * Each role can have a description
   */
  {
    name: "role",
    recreate: true,
    schema: (table, connection) => {
      table.increments("id");
      table.string("name").notNullable().unique();
      table.string("description");
      table.timestamp("createdAt").defaultTo(connection.fn.now());
      table.timestamp("updatedAt").defaultTo(connection.fn.now());
      table.string("createdBy").defaultTo("system");
      table.string("updatedBy").defaultTo("system");
    },
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
    recreate: true,
    schema: (table, connection) => {
      table.increments("id");
      table.integer("roleId").notNullable().references("role.id");
      table.string("action");
      table.string("resource");
      table.timestamp("createdAt").defaultTo(connection.fn.now());
      table.timestamp("updatedAt").defaultTo(connection.fn.now());
      table.string("createdBy").defaultTo("system");
      table.string("updatedBy").defaultTo("system");
    },
  },

  /**
   * Create the organization table.
   */
  {
    name: "organization",
    recreate: true,
    schema: (table, connection) => {
      table.increments("id");
      table.integer("order");
      table.string("name").notNullable().unique();
      table.enum("status", ["inactive", "active"]).defaultTo("active");
      table.timestamp("createdAt").defaultTo(connection.fn.now());
      table.timestamp("updatedAt").defaultTo(connection.fn.now());
      table.string("createdBy").defaultTo("system");
      table.string("updatedBy").defaultTo("system");
    },
  },

  /**
   * Create the user table.
   * Each user has a unique name and optionally, a role
   */
  {
    name: "user",
    recreate: true,
    schema: (table, connection) => {
      table.increments("id");
      table.integer("roleId").references("role.id");
      table.integer("organizationId").references("organization.id");
      table.string("organizationOther");
      table.string("accountType");
      table.string("name").notNullable().unique();
      table.string("firstName");
      table.string("lastName");
      table.string("email").unique();
      table.enum("status", ["pending", "rejected", "inactive", "active"]).defaultTo("pending");
      table.boolean("receiveNotification").defaultTo(true);
      table.text("notes");
      table.timestamp("createdAt").defaultTo(connection.fn.now());
      table.timestamp("updatedAt").defaultTo(connection.fn.now());
      table.string("createdBy").defaultTo("system");
      table.string("updatedBy").defaultTo("system");
    },
  },

  {
    name: "mapBinsToGenes",
    type: "function",
    schema: () => {
      return `
        drop procedure if exists mapBinsToGenes;
        create or replace procedure mapBinsToGenes(idat text) 
          language plpgsql as $$
          begin
            EXECUTE format('
              with geneMap as (
                  select id, string_agg(distinct gene, '';'') as gene from (
                      select c.id, g.name as gene
                      from "cnvBin" c
                        join "gene" g on
                          c.chromosome = g.chromosome and
                          c.start <= g.start and
                          g.start < c.end
                      where c."sampleIdatFilename" = %L
                      union
                      select c.id, g.name as gene
                      from "cnvBin" c
                        join "gene" g on
                          c.chromosome = g.chromosome and
                          g.start < c.start and
                          c.start < g."end"
                        where c."sampleIdatFilename" = %L
                  ) as c group by c.id
              ) update "cnvBin" cnv
                  set gene = geneMap.gene
                  from geneMap
                  where cnv.id = geneMap.id;', 
              idat, 
              idat
            );
          end
          $$;`;
    },
  },

  {
    name: "mapAllBinsToGenes",
    type: "function",
    schema: () => {
      return `
        drop procedure if exists mapAllBinsToGenes;
        create or replace procedure mapAllBinsToGenes()
        language plpgsql as $$
        declare
            c text;
        begin
            for c in
                select distinct "sampleIdatFilename"from "cnvBin"
                  group by "sampleIdatFilename"
                  having count(gene) = 0
            loop
                execute format('call mapBinsToGenes(%L)', c);
            end loop;
        end;
        $$;`;
    },
  },

  {
    name: "getChromosomeOffset",
    type: "function",
    schema: () => {
      return `create or replace function getChromosomeOffset (chromosome numeric)
          returns numeric immutable as $$
          select case
              when $1 = 1 then 0
              when $1 = 2 then 249250621
              when $1 = 3 then 492449994
              when $1 = 4 then 690472424
              when $1 = 5 then 881626700
              when $1 = 6 then 1062541960
              when $1 = 7 then 1233657027
              when $1 = 8 then 1392795690
              when $1 = 9 then 1539159712
              when $1 = 10 then 1680373143
              when $1 = 11 then 1815907890
              when $1 = 12 then 1950914406
              when $1 = 13 then 2084766301
              when $1 = 14 then 2199936179
              when $1 = 15 then 2307285719
              when $1 = 16 then 2409817111
              when $1 = 17 then 2500171864
              when $1 = 18 then 2581367074
              when $1 = 19 then 2659444322
              when $1 = 20 then 2718573305
              when $1 = 21 then 2781598825
              when $1 = 22 then 2829728720
              when $1 = 23 then 2881033286
              when $1 = 24 then 3036303846
              else 0
          END
      $$ language sql;`;
    },
  },
];
