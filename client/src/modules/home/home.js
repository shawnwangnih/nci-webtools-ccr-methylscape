import { useRecoilValue } from 'recoil';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import HomeImage from './images/home.svg';
import { sessionState } from '../session/session.state';
import './home.scss';
import backgroundImage from './images/Main_Graphic.png'

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

      {/* <div className="h-100"> */}
        <div className="text-white p-0 m-0  vw-100 img-fluid" style={{ backgroundImage: `url(${backgroundImage})` }}>
          <Row md={2}>
            <Col md={{ span: 3, offset: 2}} className="py-9 text-end">
              <h1>Methylscape</h1>
              <h2>Analysis</h2>
              <p className="my-4 text-right">Explore the clinically-reportable assay that uses genome-wide DNA methylation profiling as a diagnostic tool for tumores of the central nervous system.</p>
              <Button variant="outline-light" size="lg" className="btn-home">Perform Analysis</Button>{' '}
            </Col>
            
            
          </Row>
          
          
      </div>
      {/* </div> */}
      
    </>
  );
}
