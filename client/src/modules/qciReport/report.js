import { Container } from 'react-bootstrap';
import { useRecoilValue } from 'recoil';
import { qciData } from './qci.state';
import Table from '../components/table';
import './qci.css';

export default function Report() {
  const tables = useRecoilValue(qciData);
  const { snvTable, cnvTable, fusionTable, unkTable } = tables;

  return (
    <Container fluid="xxl">
      {Object.keys(tables).length &&
      (snvTable.data.length ||
        cnvTable.data.length ||
        fusionTable.data.length ||
        unkTable.data.length) ? (
        <div>
          <div id="significantTables">
            <h2>VARIANTS OF CLINICAL OR PATHOGENIC SIGNIFICANCE</h2>
            {snvTable.data.length ? (
              <div>
                <Table {...snvTable} size="small" />{' '}
                <sub>
                  *VAF: Variant Allele Frequency; **TIER: Actionability
                  Classification
                </sub>
              </div>
            ) : (
              <h3 className="noDataTitle">
                No reportable small nucleotide variants detected.
              </h3>
            )}
            {cnvTable.data.length ? (
              <div>
                <Table {...cnvTable} />
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
              </div>
            ) : (
              <h3 className="noDataTitle">No reportable CNVs.</h3>
            )}
            {fusionTable.data.length ? (
              <div>
                <Table {...fusionTable} />
                <sub>**TIER: Actionability Classification</sub>
              </div>
            ) : (
              <h3 className="noDataTitle">
                No reportable fusions or rearrangements.
              </h3>
            )}
          </div>
          <div id="uncertainSignificance">
            <h2>VARIANTS OF UNCERTAIN CLINICAL SIGNIFICANCE</h2>
            {unkTable.data.length ? (
              <div>
                <Table {...unkTable} />
                <sub>*VAF: Variant Allele Frequency</sub>
              </div>
            ) : (
              <h3 className="noDataTitle">
                No reportable variants of uncertain significance
              </h3>
            )}
          </div>
        </div>
      ) : (
        <h4>No Report Available</h4>
      )}
    </Container>
  );
}
