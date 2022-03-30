import { useRecoilValue } from 'recoil';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import HomeImage from './images/home.svg';
import { sessionState } from '../session/session.state';
import './home.scss';

export default function Home() {
  const session = useRecoilValue(sessionState);

  return (
    <>
      <div
        className="cover-image py-5 mb-4 shadow-sm"
        style={{ backgroundImage: `url(${HomeImage})` }}
      >
        <Container>
          <h1 className="display-4 mb-4">
            <span className="d-inline-block py-4 border-bottom border-dark">
              Methylscape
            </span>
          </h1>

          <p className="lead">Application Description</p>
          {session.authenticated && (
            <NavLink className="btn btn-outline-primary" to="analysis">
              Perform Analysis
            </NavLink>
          )}
        </Container>
      </div>

      <Container className="mb-4 text-white">
        <Row>
          <Col md={4}>
            <h2>Methylscape</h2>
          </Col>
          <Col md={8}>
            <p>
              The NCI Laboratory of Pathology has implemented a novel
              clinically-reportable assay that uses genome-wide DNA methylation
              profiling as a diagnostic tool for tumors of the central nervous
              system. The validated tool is based, in part, on data published in
              a recent Nature study (Capper et al., 2018) that showed tumor
              methylation profiles can serve as an important adjunct and help
              refine morphology-based diagnostics in tumors of the brain and
              spinal cord. Notably, methylation results led to diagnostic
              revisions in a significant proportion (129/139 or 12% of the
              entire cohort) of cases.This finding was confirmed in five
              external centers (50/401, 12%), with reclassification rates in
              6%-25% of cases.
            </p>
            <p>
              Since its adaptation as an investigative diagnostic tool in 2018,
              Infinium methylation arrays have led to the identification of new
              CNS tumor types and subtypes, many of which harbor meaningful
              associations with clinical course and outcome. Not infrequently,
              however, classification results may be non-contributory
              (suboptimal classifier score) or not congruent with the clinical,
              histopathologic, or molecular features of the case (misleading
              profile). Interpretation can often be improved with visual
              inspection of unsupervised UMAP or t-SNE embedding(s).
            </p>
            <p>
              The NCI Laboratory of Pathology is poised to become a diagnostic
              reference center to implement this tool for diagnostically
              challenging neuropathology cases. Going forward, it is likely that
              new methylation-based classifiers will emerge for additional tumor
              types. Areas of future growth include the implementation of
              clinical whole-exome sequencing, gene expression diagnostics
              (RNA-seq), and a dynamic liquid biopsy program.
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
}
