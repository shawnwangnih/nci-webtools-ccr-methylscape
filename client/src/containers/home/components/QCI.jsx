import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table } from 'antd';
import { xml2js } from 'xml-js';
import './QCI.css';

export default function QCI() {
  const { id } = useParams();
  console.log('param', id);

  const [snvTable, setSnv] = useState({
    columns: [
      {
        title: 'GENE',
        dataIndex: 'gene',
        align: 'center',
        render: text => boldItalic(text)
      },
      {
        title: 'GENOMIC LOCATION',
        dataIndex: 'genomicLocation',
        align: 'center'
      },
      { title: 'TRANSCRIPT', dataIndex: 'transcript', align: 'center' },
      {
        title: 'NUCLEOTIDE CHANGE',
        dataIndex: 'nucleotideChange',
        align: 'center'
      },
      {
        title: 'AMINO ACID CHANGE',
        dataIndex: 'aminoAcidChange',
        align: 'center'
      },
      { title: 'VAF* (%)', dataIndex: 'vaf', align: 'center' },
      {
        title: 'PATHOGENICITY ASSESSMENT',
        dataIndex: 'pathAssessment',
        align: 'center',
        render: text => displayRed(text)
      },
      { title: 'TIER**', dataIndex: 'tier', align: 'center' }
    ],
    data: []
  });
  const [cnvTable, setCnv] = useState({
    columns: [
      {
        title: 'GENE',
        dataIndex: 'gene',
        align: 'center',
        render: text => displayGeneRef(text)
      },
      {
        title: 'GENOMIC LOCATION',
        dataIndex: 'genomicLocation',
        align: 'center'
      },
      {
        title: 'PATHOGENICITY ASSESSMENT',
        dataIndex: 'pathAssessment',
        align: 'center',
        render: text => displayRed(text)
      },
      { title: 'TIER**', dataIndex: 'tier', align: 'center' }
    ],
    data: []
  });
  const [fusionTable, setFusion] = useState({
    columns: [
      {
        title: 'GENE',
        dataIndex: 'gene',
        align: 'center',
        render: text => displayGeneRef(text)
      },
      {
        title: 'GENOMIC LOCATION',
        dataIndex: 'genomicLocation',
        align: 'center'
      },
      { title: 'READS', dataIndex: 'reads', align: 'center' },
      {
        title: 'PATHOGENICITY ASSESSMENT',
        dataIndex: 'pathAssessment',
        align: 'center',
        render: text => displayRed(text)
      },
      { title: 'TIER**', dataIndex: 'tier', align: 'center' }
    ],
    data: []
  });
  const [unkTable, setUnk] = useState({
    columns: [
      { title: 'GENE', dataIndex: 'gene', align: 'center' },
      {
        title: 'GENOMIC LOCATION',
        dataIndex: 'genomicLocation',
        align: 'center'
      },
      { title: 'TRANSCRIPT', dataIndex: 'transcript', align: 'center' },
      {
        title: 'NUCLEOTIDE CHANGE',
        dataIndex: 'nucleotideChange',
        align: 'center'
      },
      {
        title: 'AMINO ACID CHANGE',
        dataIndex: 'aminoAcidChange',
        align: 'center'
      },
      { title: 'VAF* (%)', dataIndex: 'vaf', align: 'center' }
    ],
    data: []
  });

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

  function parseVariants(file) {
    let reader = new FileReader();
    reader.onload = () => {
      const result = xml2js(reader.result, { compact: true });
      let variants = result.report.variant.reverse();
      if (!Array.isArray(variants)) variants = [variants];
      const significant = variants.filter(v =>
        v.assessment._text.match(/pathogenic/gi)
      );
      const uncertain = variants.filter(v =>
        v.assessment._text.match(/uncertain/gi)
      );
      // console.log('sig', significant);
      // console.log('un', uncertain);
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

    variants.forEach(v => {
      const loc = `chr${v.chromosome._text}:${v.position._text}`;
      const tier = `Tier ${v.actionability._text}`;

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
          vaf: vaf,
          pathAssessment: v.assessment._text,
          tier: tier,
          interpretation: v.rcomment[0].text._text
        });
      } else if (v.length) {
        const gene = `${v.structuralChange.gene._text} ${v.reference._text}`;

        cnvData.push({
          key: cnvData.length,
          gene: gene,
          genomicLocation: loc,
          pathAssessment: v.assessment._text,
          tier: tier,
          interpretation: v.rcomment[0].text._text
        });
      } else if (v.readDepth) {
        const gene = `${v.structuralChange.gene._text} ${v.reference._text}`;

        fusionData.push({
          key: fusionData.length,
          gene: gene,
          genomicLocation: loc,
          reads: v.readDepth._text,
          pathAssessment: v.assessment._text,
          tier: tier,
          interpretation: v.rcomment[0].text._text
        });
      }
    });
    setSnv({ ...snvTable, ...{ data: snvData } });
    setCnv({ ...cnvTable, ...{ data: cnvData } });
    setFusion({ ...fusionTable, ...{ data: fusionData } });
  }

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
        vaf: vaf
      };
    });

    setUnk({ ...unkTable, ...{ data: data } });
  }

  return (
    <div>
      <div>
        <label>Upload Here</label>
        <input
          type="file"
          id="xmlInput"
          onChange={e => {
            parseVariants(e.target.files[0]);
          }}
        />
        <div>
          <div>
            <h2>VARIANTS OF CLINICAL OR PATHOGENIC SIGNIFICANCE</h2>
            <Table
              columns={snvTable.columns}
              dataSource={snvTable.data}
              pagination={false}
              expandedRowRender={record => renderHTML(record.interpretation)}
              bordered
              title={() => <h3>SMALL NUCLEOTIDE VARIANTS</h3>}
              footer={() => (
                <sub>
                  *VAF: Variant Allele Frequency; **TIER: Actionability
                  Classification
                </sub>
              )}
            />{' '}
            <Table
              columns={cnvTable.columns}
              dataSource={cnvTable.data}
              pagination={false}
              expandedRowRender={record => renderHTML(record.interpretation)}
              bordered
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
                      CNV analysis is not performed when tumor content &lt;50%.
                    </sub>
                  </div>
                </div>
              )}
            />{' '}
            <Table
              columns={fusionTable.columns}
              dataSource={fusionTable.data}
              pagination={false}
              expandedRowRender={record => renderHTML(record.interpretation)}
              bordered
              title={() => <h3>STRUCTURAL VARIANTS: FUSION</h3>}
              footer={() => <sub>**TIER: Actionability Classification</sub>}
            />
          </div>
          <div>
            <h2>VARIANTS OF UNCERTAIN CLINICAL SIGNIFICANCE</h2>
            <Table
              columns={unkTable.columns}
              dataSource={unkTable.data}
              pagination={false}
              bordered
              title={() => (
                <h3>STRUCTURAL VARIANTS: COPY NUMBER VARIATION (CNV)</h3>
              )}
              footer={() => <sub>*VAF: Variant Allele Frequency</sub>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
