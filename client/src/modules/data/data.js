import { Suspense } from 'react';
import Container from 'react-bootstrap/Container';
import { useRecoilValue } from 'recoil';
import CountUp from 'react-countup';
import { methylscapeData } from './data.state';
import { NavLink } from 'react-router-dom';
import { PieChartFill, ClipboardData, PeopleFill } from 'react-bootstrap-icons';
import { Outlet } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Loader from '../components/loader';
import ErrorBoundary from '../components/error-boundary';
import './data.scss';

export default function Data() {
  const { data, projectsCount, experimentsCount, samplesCount } =
    useRecoilValue(methylscapeData);

  return (
    <div>
    <h3 className='text-white p-4'>Samples</h3>
      <Container fluid="xxl" className="d-flex p-4 bg-light justify-content-center">
        <ErrorBoundary
          fallback={
            <Alert variant="danger">
              An internal error prevented plots from loading. Please contact the
              website administrator if this problem persists.
            </Alert>
          }
        >
          <Suspense fallback={<Loader message="Loading Samples" />}>
            <NavLink to={'projects'} className="text-decoration-none d-flex">
              <PieChartFill className="stat-icon" />
              {data.length ? (
                <CountUp
                  className="countup"
                  start={projectsCount / 2}
                  end={projectsCount}
                  duration={1}
                />
              ) : (
                <span className="countup">0</span>
              )}
              <h3 className="fw-light text-black">Projects</h3>
            </NavLink>
            <NavLink
              to={'experiments'}
              className="text-decoration-none d-flex ms-4"
            >
              <ClipboardData className="stat-icon" />
              {data.length ? (
                <CountUp
                  className="countup"
                  start={experimentsCount / 2}
                  end={experimentsCount}
                  duration={1}
                />
              ) : (
                <span className="countup">0</span>
              )}
              <h3 className="fw-light text-black">Experiments</h3>
            </NavLink>
            <NavLink
              to={'samples'}
              className="text-decoration-none d-flex ms-4"
            >
              <PeopleFill className="stat-icon" />
              {data.length ? (
                <CountUp
                  className="countup"
                  start={samplesCount / 2}
                  end={samplesCount}
                  duration={1}
                />
              ) : (
                <span className="countup">0</span>
              )}
              <h3 className="fw-light text-black">Samples</h3>
            </NavLink>
          </Suspense>
        </ErrorBoundary>
      </Container>
      <Container fluid="xxl" className="bg-white">
        <Outlet />
      </Container>
    </div>
  );
}
