import { useRecoilValue } from 'recoil';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import HomeImage from './images/home.svg';
import { sessionState } from '../session/session.state';
import './home.scss';

export default function Home() {
  const session = useRecoilValue(sessionState);

  return (
    <>
      {/* <div
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
      </div> */}

      <div>
        <Container className="my-9 text-white">
          <Row md={2}>
            <Col md={{ span: 3, offset: 3 }} className="">
              <h1>Methylscape</h1>
              <h3>Analysis</h3>
              <p className="text-right">Explore the clinically-reportable assay that uses genome-wide DNA methylation profiling as a diagnostic tool for tumores of the central nervous system.</p>
              <Button variant="outline-light" size="lg" className="btn-home">Perform Analysis</Button>{' '}
            </Col>
            <Col>
              
            </Col>
            
          </Row>
          
          
      </Container>
      </div>
      
    </>
  );
}
