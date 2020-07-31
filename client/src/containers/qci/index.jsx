import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Modal, Spin } from 'antd';
import { xml2js } from 'xml-js';
import './QCI.css';

export default function QCI() {
  const { id, file } = useParams();
  const [tryS3, setTryS3] = useState(false);
  const [snvTable, setSnv] = useState({
    columns: [
      {
        title: 'GENE',
        dataIndex: 'gene',
        align: 'center',
        render: (text) => boldItalic(text),
      },
      {
        title: 'GENOMIC LOCATION',
        dataIndex: 'genomicLocation',
        align: 'center',
      },
      { title: 'TRANSCRIPT', dataIndex: 'transcript', align: 'center' },
      {
        title: 'NUCLEOTIDE CHANGE',
        dataIndex: 'nucleotideChange',
        align: 'center',
      },
      {
        title: 'AMINO ACID CHANGE',
        dataIndex: 'aminoAcidChange',
        align: 'center',
      },
      { title: 'VAF* (%)', dataIndex: 'vaf', align: 'center' },
      {
        title: 'PATHOGENICITY ASSESSMENT',
        dataIndex: 'pathAssessment',
        align: 'center',
        render: (text) => displayRed(text),
      },
      { title: 'TIER**', dataIndex: 'tier', align: 'center' },
    ],
    data: [],
    expandedRowKeys: [],
    onExpand: (expanded, record) =>
      manageExpandedRows(expanded, record, setSnv),
  });
  const [cnvTable, setCnv] = useState({
    columns: [
      {
        title: 'GENE',
        dataIndex: 'gene',
        align: 'center',
        render: (text) => displayGeneRef(text),
      },
      {
        title: 'GENOMIC LOCATION',
        dataIndex: 'genomicLocation',
        align: 'center',
      },
      {
        title: 'PATHOGENICITY ASSESSMENT',
        dataIndex: 'pathAssessment',
        align: 'center',
        render: (text) => displayRed(text),
      },
      { title: 'TIER**', dataIndex: 'tier', align: 'center' },
    ],
    data: [],
    expandedRowKeys: [],
    onExpand: (expanded, record) =>
      manageExpandedRows(expanded, record, setCnv),
  });
  const [fusionTable, setFusion] = useState({
    columns: [
      {
        title: 'GENE',
        dataIndex: 'gene',
        align: 'center',
        render: (text) => displayGeneRef(text),
      },
      {
        title: 'GENOMIC LOCATION',
        dataIndex: 'genomicLocation',
        align: 'center',
      },
      { title: 'READS', dataIndex: 'reads', align: 'center' },
      {
        title: 'PATHOGENICITY ASSESSMENT',
        dataIndex: 'pathAssessment',
        align: 'center',
        render: (text) => displayRed(text),
      },
      { title: 'TIER**', dataIndex: 'tier', align: 'center' },
    ],
    data: [],
    expandedRowKeys: [],
    onExpand: (expanded, record) =>
      manageExpandedRows(expanded, record, setFusion),
  });
  const [unkTable, setUnk] = useState({
    columns: [
      { title: 'GENE', dataIndex: 'gene', align: 'center' },
      {
        title: 'GENOMIC LOCATION',
        dataIndex: 'genomicLocation',
        align: 'center',
      },
      { title: 'TRANSCRIPT', dataIndex: 'transcript', align: 'center' },
      {
        title: 'NUCLEOTIDE CHANGE',
        dataIndex: 'nucleotideChange',
        align: 'center',
      },
      {
        title: 'AMINO ACID CHANGE',
        dataIndex: 'aminoAcidChange',
        align: 'center',
      },
      { title: 'VAF* (%)', dataIndex: 'vaf', align: 'center' },
    ],
    data: [],
  });

  // attempt do download from s3 on component render
  useEffect(() => {
    setTryS3(false);
    downloadFile(id, file);
  }, []);

  // manage keys of expanded rows
  function manageExpandedRows(expanded, record, setter) {
    expanded
      ? setter((prevTable) => ({
          ...prevTable,
          ...{ expandedRowKeys: [...prevTable.expandedRowKeys, record.key] },
        }))
      : setter((prevTable) => ({
          ...prevTable,
          ...{
            expandedRowKeys: prevTable.expandedRowKeys.filter(
              (key) => key != record.key
            ),
          },
        }));
  }

  //Helper to download files from the s3 bucket
  async function downloadFile(sampleId, file) {
    try {
      let response = await fetch(`/getMethylScapeFile`, {
        method: 'POST',
        body: JSON.stringify({
          sampleId: sampleId,
          fileName: file,
        }),
      });
      if (response.status == 404) {
        setTryS3(true);
        // Modal.error({
        //   title: 'Could Not Find QCI Report',
        //   content: 'some messages...some messages...',
        // });
      } else {
        let xml = await response.text();
        parseVariants(xml);
      }
    } catch (e) {
      setTryS3(true);
      console.log(e);
    }
  }

  // display gene with reference
  function displayGeneRef(gene) {
    return (
      <div>
        <div>
          <b>
            <i>{gene.split(' ')[0]}</i>
          </b>
        </div>
        <div>{gene.split(' ')[1]}</div>
      </div>
    );
  }
  // bold and italicize text
  function boldItalic(text) {
    return (
      <b>
        <i>{text}</i>
      </b>
    );
  }
  // red text
  function displayRed(text) {
    return <span className="textRed">{text}</span>;
  }
  // render string as html
  function renderHTML(html) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
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
      v.assessment._text.match(/pathogenic/gi)
    );
    const uncertain = variants.filter((v) =>
      v.assessment._text.match(/uncertain/gi)
    );
    sigVariants(significant);
    unknownVariants(uncertain);
    setTryS3(true);
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
          key: snvData.length,
          gene: v.gene._text,
          genomicLocation: loc,
          transcript: v.transcriptchange.transcript._text,
          nucleotideChange: v.transcriptchange.change._text,
          aminoAcidChange: v.proteinchange ? v.proteinchange.change._text : '-',
          vaf: vaf,
          pathAssessment: v.assessment._text,
          tier: tier,
          interpretation: getInterpretation(v.rcomment),
        });
        // STRUCTURAL VARIANTS: COPY NUMBER VARIATION (CNV)
      } else if (v.length) {
        const gene = `${v.structuralChange.gene._text} ${v.reference._text}`;

        cnvData.push({
          key: cnvData.length,
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
          key: fusionData.length,
          gene: gene,
          genomicLocation: loc,
          reads: v.readDepth._text,
          pathAssessment: v.assessment._text,
          tier: tier,
          interpretation: getInterpretation(v.rcomment),
        });
      }
    });

    setSnv({ ...snvTable, ...{ data: snvData } });
    setCnv({ ...cnvTable, ...{ data: cnvData } });
    setFusion({ ...fusionTable, ...{ data: fusionData } });
  }

  // VARIANTS OF UNCERTAIN CLINICAL SIGNIFICANCE
  function unknownVariants(variants) {
    let data = variants.map((v, i) => {
      const loc = `chr${v.chromosome._text}:${v.position._text}`;
      const vaf = `${Number.parseFloat(v.allelefraction._text)}% (of ${
        v.readdepth._text
      } reads)`;
      return {
        key: i,
        gene: v.gene._text,
        genomicLocation: loc,
        transcript: v.transcriptchange.transcript._text,
        nucleotideChange: v.transcriptchange.change._text,
        aminoAcidChange: v.proteinchange ? v.proteinchange.change._text : '-',
        vaf: vaf,
      };
    });

    setUnk({ ...unkTable, ...{ data: data } });
  }

  // debugging
  function parseUpload(file) {
    let reader = new FileReader();
    reader.onload = () => {
      const result = xml2js(reader.result, { compact: true });
      let variants = result.report.variant;
      !Array.isArray(variants)
        ? (variants = [variants])
        : (variants = variants.reverse());
      const significant = variants.filter((v) =>
        v.assessment._text.match(/pathogenic/gi)
      );
      const uncertain = variants.filter((v) =>
        v.assessment._text.match(/uncertain/gi)
      );
      console.log('sig', significant);
      console.log('un', uncertain);
      sigVariants(significant);
      unknownVariants(uncertain);
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <div
        style={{ backgroundColor: 'rgb(240, 242, 245)', paddingBottom: '1rem' }}
      ></div>
      {tryS3 ? (
        snvTable.data.length ||
        cnvTable.data.length ||
        fusionTable.data.length ||
        unkTable.data.length ? (
          <div>
            <div id="significantTables">
              <h2>VARIANTS OF CLINICAL OR PATHOGENIC SIGNIFICANCE</h2>
              {snvTable.data.length ? (
                <Table
                  columns={snvTable.columns}
                  dataSource={snvTable.data}
                  pagination={false}
                  expandRowByClick={true}
                  expandedRowRender={(record) =>
                    renderHTML(record.interpretation)
                  }
                  expandedRowKeys={snvTable.expandedRowKeys}
                  onExpand={snvTable.onExpand}
                  size="small"
                  title={() => <h3>SMALL NUCLEOTIDE VARIANTS</h3>}
                  footer={() => (
                    <sub>
                      *VAF: Variant Allele Frequency; **TIER: Actionability
                      Classification
                    </sub>
                  )}
                />
              ) : (
                <h3 className="noDataTitle">
                  No reportable small nucleotide variants detected.
                </h3>
              )}
              {cnvTable.data.length ? (
                <Table
                  columns={cnvTable.columns}
                  dataSource={cnvTable.data}
                  pagination={false}
                  expandRowByClick={true}
                  expandedRowRender={(record) =>
                    renderHTML(record.interpretation)
                  }
                  expandedRowKeys={cnvTable.expandedRowKeys}
                  onExpand={cnvTable.onExpand}
                  size="small"
                  title={() => (
                    <h3>STRUCTURAL VARIANTS: COPY NUMBER VARIATION (CNV)</h3>
                  )}
                  footer={() => (
                    <div>
                      <div>
                        <sub>**TIER: Actionability Classification</sub>
                      </div>
                      <div>
                        <sub>
                          CNV analysis is not performed when tumor content
                          &lt;50%.
                        </sub>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <h3 className="noDataTitle">No reportable CNVs.</h3>
              )}
              {fusionTable.data.length ? (
                <Table
                  columns={fusionTable.columns}
                  dataSource={fusionTable.data}
                  pagination={false}
                  expandRowByClick={true}
                  expandedRowRender={(record) =>
                    renderHTML(record.interpretation)
                  }
                  expandedRowKeys={fusionTable.expandedRowKeys}
                  onExpand={fusionTable.onExpand}
                  size="small"
                  title={() => <h3>STRUCTURAL VARIANTS: FUSION</h3>}
                  footer={() => <sub>**TIER: Actionability Classification</sub>}
                />
              ) : (
                <h3 className="noDataTitle">
                  No reportable fusions or rearrangements.
                </h3>
              )}
            </div>
            <div id="uncertainSignificance">
              <h2>VARIANTS OF UNCERTAIN CLINICAL SIGNIFICANCE</h2>
              {unkTable.data.length ? (
                <Table
                  columns={unkTable.columns}
                  dataSource={unkTable.data}
                  pagination={false}
                  size="small"
                  title={() => <h3>UNKNOWN</h3>}
                  footer={() => <sub>*VAF: Variant Allele Frequency</sub>}
                />
              ) : (
                <h3 className="noDataTitle">
                  No reportable variants of uncertain significance
                </h3>
              )}
            </div>
          </div>
        ) : (
          <h2>No Report Available</h2>
        )
      ) : (
        <h2>
          <Spin size="large"></Spin> Loading
        </h2>
      )}

      {/* <span>
        Debugging
        <label>Upload Here</label>
        <input
          type="file"
          id="xmlInput"
          onChange={(e) => {
            parseUpload(e.target.files[0]);
          }}
        />
      </span>
      <span>
        <button
          onClick={() => {
            downloadFile(id, file);
          }}
        >
          s3
        </button>
      </span> */}
    </div>
  );
}
