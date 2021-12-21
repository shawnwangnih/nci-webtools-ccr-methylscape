import { atom, selector } from "recoil";
import { json2xml, xml2js } from "xml-js";

export const defaultQCIState = {
  id: "",
  file: "",
};

export const QCIState = atom({
  key: "qciState",
  default: defaultQCIState,
});

export const qciData = selector({
  key: "qciData",
  get: async ({ get }) => {
    const { id, file } = get(QCIState);
    let snvTable = {
      columns: [
        {
          Header: "GENE",
          accessor: "gene",

          Cell: ({ value }) => (
            <b>
              <i>{value}</i>
            </b>
          ),
        },
        {
          Header: "GENOMIC LOCATION",
          accessor: "genomicLocation",
        },
        { Header: "TRANSCRIPT", accessor: "transcript" },
        {
          Header: "NUCLEOTIDE CHANGE",
          accessor: "nucleotideChange",
        },
        {
          Header: "AMINO ACID CHANGE",
          accessor: "aminoAcidChange",
        },
        { Header: "VAF* (%)", accessor: "vaf" },
        {
          Header: "PATHOGENICITY ASSESSMENT",
          accessor: "pathAssessment",

          Cell: ({ value }) => <span className="textRed">{value}</span>,
        },
        { Header: "TIER**", accessor: "tier" },
      ],
      data: [],
    };
    let cnvTable = {
      columns: [
        {
          Header: "GENE",
          accessor: "gene",

          Cell: ({ value }) => (
            <div>
              <div>
                <b>
                  <i>{value.split(" ")[0]}</i>
                </b>
              </div>
              <div>{value.split(" ")[1]}</div>
            </div>
          ),
        },
        {
          Header: "GENOMIC LOCATION",
          accessor: "genomicLocation",
        },
        {
          Header: "PATHOGENICITY ASSESSMENT",
          accessor: "pathAssessment",

          Cell: ({ value }) => <span className="textRed">{value}</span>,
        },
        { Header: "TIER**", accessor: "tier" },
      ],
      data: [],
    };
    let fusionTable = {
      columns: [
        {
          Header: "GENE",
          accessor: "gene",

          Cell: ({ value }) => (
            <div>
              <div>
                <b>
                  <i>{value.split(" ")[0]}</i>
                </b>
              </div>
              <div>{value.split(" ")[1]}</div>
            </div>
          ),
        },
        {
          Header: "GENOMIC LOCATION",
          accessor: "genomicLocation",
        },
        { Header: "READS", accessor: "reads" },
        {
          Header: "PATHOGENICITY ASSESSMENT",
          accessor: "pathAssessment",

          Cell: ({ value }) => <span className="textRed">{value}</span>,
        },
        { Header: "TIER**", accessor: "tier" },
      ],
      data: [],
    };
    let unkTable = {
      columns: [
        { Header: "GENE", accessor: "gene" },
        {
          Header: "GENOMIC LOCATION",
          accessor: "genomicLocation",
        },
        { Header: "TRANSCRIPT", accessor: "transcript" },
        {
          Header: "NUCLEOTIDE CHANGE",
          accessor: "nucleotideChange",
        },
        {
          Header: "AMINO ACID CHANGE",
          accessor: "aminoAcidChange",
        },
        { Header: "VAF* (%)", accessor: "vaf" },
      ],
      data: [],
    };

    //Helper to download files from the s3 bucket
    async function downloadFile(id, file) {
      try {
        let response = await fetch(`api/getFile`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sample: id + "/" + file,
          }),
        });
        if (!response.ok) {
          return false;
        } else {
          let xml = await response.text();
          parseVariants(xml);
        }
      } catch (e) {
        console.log(e);
      }
    }

    function getInterpretation(rcomment) {
      if (Array.isArray(rcomment)) {
        return rcomment[0].text._text;
      } else {
        return rcomment.text._text;
      }
    }

    function parseVariants(file) {
      const parsed = xml2js(file, { compact: true });
      let variants = parsed.report.variant;
      !Array.isArray(variants)
        ? (variants = [variants])
        : (variants = variants.reverse());
      const significant = variants.filter((v) =>
        v.assessment._text.match(/pathogenic/gi),
      );
      const uncertain = variants.filter((v) =>
        v.assessment._text.match(/uncertain/gi),
      );
      sigVariants(significant);
      unknownVariants(uncertain);
    }

    // VARIANTS OF CLINICAL OR PATHOGENIC SIGNIFICANCE
    function sigVariants(variants) {
      let snvData = [];
      let cnvData = [];
      let fusionData = [];

      variants.forEach((v) => {
        const loc = `chr${v.chromosome._text}:${v.position._text}`;
        const tier = `Tier ${v.actionability._text}`;

        // SMALL NUCLEOTIDE VARIANTS (SNV)
        if (v.gene) {
          const vaf = `${Number.parseFloat(v.allelefraction._text)}% (of ${
            v.readdepth._text
          } reads)`;
          snvData.push({
            gene: v.gene._text,
            genomicLocation: loc,
            transcript: v.transcriptchange.transcript._text,
            nucleotideChange: v.transcriptchange.change._text,
            aminoAcidChange: v.proteinchange
              ? v.proteinchange.change._text
              : "-",
            vaf: vaf,
            pathAssessment: v.assessment._text,
            tier: tier,
            interpretation: getInterpretation(v.rcomment),
          });
          // STRUCTURAL VARIANTS: COPY NUMBER VARIATION (CNV)
        } else if (v.length) {
          const gene = `${v.structuralChange.gene._text} ${v.reference._text}`;

          cnvData.push({
            gene: gene,
            genomicLocation: loc,
            pathAssessment: v.assessment._text,
            tier: tier,
            interpretation: getInterpretation(v.rcomment),
          });
          // STRUCTURAL VARIANTS: FUSION
        } else if (v.readDepth) {
          const gene = `${v.structuralChange.gene._text} ${v.reference._text}`;

          fusionData.push({
            gene: gene,
            genomicLocation: loc,
            reads: v.readDepth._text,
            pathAssessment: v.assessment._text,
            tier: tier,
            interpretation: getInterpretation(v.rcomment),
          });
        }
      });

      snvTable.data = snvData;
      cnvTable.data = cnvData;
      fusionTable.data = fusionData;
    }

    // VARIANTS OF UNCERTAIN CLINICAL SIGNIFICANCE
    function unknownVariants(variants) {
      let data = variants.map((v, i) => {
        const loc = `chr${v.chromosome._text}:${v.position._text}`;
        const vaf = `${Number.parseFloat(v.allelefraction._text)}% (of ${
          v.readdepth._text
        } reads)`;
        return {
          gene: v.gene._text,
          genomicLocation: loc,
          transcript: v.transcriptchange.transcript._text,
          nucleotideChange: v.transcriptchange.change._text,
          aminoAcidChange: v.proteinchange ? v.proteinchange.change._text : "-",
          vaf: vaf,
        };
      });

      unkTable.data = data;
    }

    const data = id && file ? downloadFile(id, file) : false;

    return data ? { snvTable, cnvTable, fusionTable, unkTable } : null;
  },
});
