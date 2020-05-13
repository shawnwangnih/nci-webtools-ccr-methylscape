import React, { useState } from 'react';
import { Table } from 'antd';
import { xml2js } from 'xml-js';

export default function QCITable(props) {
  const [snvTable, setSnv] = useState({
    columns: [
      { title: 'GENE', dataIndex: 'gene' },
      { title: 'GENOMIC LOCATION', dataIndex: 'genomicLocation' },
      { title: 'TRANSCRIPT', dataIndex: 'transcript' },
      { title: 'NUCLEOTIDE CHANGE', dataIndex: 'nucleotideChange' },
      { title: 'AMINO ACID CHANGE', dataIndex: 'aminoAcidChange' },
      { title: 'VAF* (%)', dataIndex: 'vaf' },
      { title: 'PATHOGENICITY ASSESSMENT', dataIndex: 'pathAssessment' },
      { title: 'TIER**', dataIndex: 'tier' },
    ],
    data: [],
  });
  const [cnvTable, setCnv] = useState({
    columns: [
      { title: 'GENE', dataIndex: 'gene' },
      { title: 'GENOMIC LOCATION', dataIndex: 'genomicLocation' },
      { title: 'PATHOGENICITY ASSESSMENT', dataIndex: 'pathAssessment' },
      { title: 'TIER**', dataIndex: 'tier' },
    ],
    data: [],
  });
  const [fusionTable, setFusion] = useState({
    columns: [
      { title: 'GENE', dataIndex: 'gene' },
      { title: 'GENOMIC LOCATION', dataIndex: 'genomicLocation' },
      { title: 'READS', dataIndex: 'reads' },
      { title: 'PATHOGENICITY ASSESSMENT', dataIndex: 'pathAssessment' },
      { title: 'TIER**', dataIndex: 'tier' },
    ],
    data: [],
  });
  const [unkTable, setUnk] = useState({
    columns: [
      { title: 'GENE', dataIndex: 'gene' },
      { title: 'GENOMIC LOCATION', dataIndex: 'genomicLocation' },
      { title: 'TRANSCRIPT', dataIndex: 'transcript' },
      { title: 'NUCLEOTIDE CHANGE', dataIndex: 'nucleotideChange' },
      { title: 'AMINO ACID CHANGE', dataIndex: 'aminoAcidChange' },
      { title: 'VAF* (%)', dataIndex: 'vaf' },
    ],
    data: [],
  });
  const [intTable, setInt] = useState({});

  function parseVariants(file) {
    let reader = new FileReader();
    reader.onload = () => {
      const result = xml2js(reader.result, { compact: true });
      let variants = result.report.variant;
      if (!Array.isArray(variants)) variants = [variants];
      const significant = variants.filter((v) => v.assessment._text.match(/pathogenic/gi));
      const uncertain = variants.filter((v) => v.assessment._text.match(/uncertain/gi));
      console.log('sig', significant);
      console.log('un', uncertain);
      sigVariants(significant);
      unknownVariants(uncertain);
    };
    reader.readAsText(file);
  }

  // VARIANTS OF CLINICAL OR PATHOGENIC SIGNIFICANCE
  function sigVariants(variants) {
    let snvData = [];
    let cnvData = [];
    let fusionData = [];

    variants.forEach((v, i) => {
      let loc = `chr${v.chromosome._text}:${v.position._text}`;
      let tier = `Tier ${v.actionability._text}`;

      if (v.gene) {
        let vaf = `${Number.parseFloat(v.allelefraction._text)}% (of ${v.readdepth._text} reads)`;
        snvData.push({
          key: snvData.length,
          gene: v.gene._text,
          genomicLocation: loc,
          transcript: v.transcriptchange.transcript._text,
          nucleotideChange: v.transcriptchange.change._text,
          vaf: vaf,
          pathAssessment: v.assessment._text,
          tier: tier,
        });
      }
      if (v.length) {
        cnvData.push({
          key: cnvData.length,
          gene: v.structuralChange.gene._text,
          genomicLocation: loc,
          pathAssessment: v.assessment._text,
          tier: tier,
        });
      }
      if (v.readDepth) {
        fusionData.push({
          key: fusionData.length,
          gene: v.structuralChange.gene._text,
          genomicLocation: loc,
          reads: v.readDepth._text,
          pathAssessment: v.assessment._text,
          tier: tier,
        });
      }
    });
    setSnv({ ...snvTable, ...{ data: snvData } });
    setCnv({ ...cnvTable, ...{ data: cnvData } });
    setFusion({ ...fusionTable, ...{ data: fusionData } });
  }

  function unknownVariants(variants) {
    let data = variants.map((v, i) => {
      let loc = `chr${v.chromosome._text}:${v.position._text}`;
      let vaf = `${Number.parseFloat(v.allelefraction._text)}% (of ${v.readdepth._text} reads)`;
      return {
        key: i,
        gene: v.gene._text,
        genomicLocation: loc,
        transcript: v.transcriptchange.transcript._text,
        nucleotideChange: v.transcriptchange.change._text,
        vaf: vaf,
      };
    });

    setUnk({ ...unkTable, ...{ data: data } });
  }

  function varientInterpretation() {}

  return (
    <div>
      <div>
        <label>Upload Here</label>
        <input
          type="file"
          id="xmlInput"
          onChange={(e) => {
            parseVariants(e.target.files[0]);
          }}
        />
        <div>
          <div>
            <h3>VARIANTS OF CLINICAL OR PATHOGENIC SIGNIFICANCE</h3>
            <Table
              columns={snvTable.columns}
              dataSource={snvTable.data}
              pagination={false}
              bordered
              title={() => <h3>SMALL NUCLEOTIDE VARIANTS</h3>}
              footer={() => (
                <sub>*VAF: Variant Allele Frequency; **TIER: Actionability Classification</sub>
              )}
            />{' '}
            <Table
              columns={cnvTable.columns}
              dataSource={cnvTable.data}
              pagination={false}
              bordered
              title={() => <h3>STRUCTURAL VARIANTS: COPY NUMBER VARIATION (CNV)</h3>}
              footer={() => (
                <div>
                  <div>
                    <sub>**TIER: Actionability Classification</sub>
                  </div>
                  <div>
                    <sub>CNV analysis is not performed when tumor content &lt;50%.</sub>
                  </div>
                </div>
              )}
            />{' '}
            <Table
              columns={fusionTable.columns}
              dataSource={fusionTable.data}
              pagination={false}
              bordered
              title={() => <h3>STRUCTURAL VARIANTS: FUSION</h3>}
              footer={() => <sub>**TIER: Actionability Classification</sub>}
            />
          </div>
          <div>
            <h3>VARIANTS OF UNCERTAIN CLINICAL SIGNIFICANCE</h3>
            <Table
              columns={unkTable.columns}
              dataSource={unkTable.data}
              pagination={false}
              bordered
              title={() => <h3>STRUCTURAL VARIANTS: COPY NUMBER VARIATION (CNV)</h3>}
              footer={() => <sub>*VAF: Variant Allele Frequency</sub>}
            />
          </div>
          <div>
            <h3>VARIANT INTERPRETATION</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
