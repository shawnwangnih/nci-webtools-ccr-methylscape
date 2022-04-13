import { Container } from 'react-bootstrap';
import { Suspense } from 'react';
import Alert from 'react-bootstrap/Alert';
import Loader from '../../components/loader';
import ErrorBoundary from '../../components/error-boundary';
import SurvivalPlot from '../survival/survival-plot';
import TableTabs from './table-tabs';

export default function Table() {
  return (
    <Container fluid>
      <TableTabs />

      <ErrorBoundary
        fallback={
          <Alert variant="danger">
            An internal error prevented plots from loading. Please contact the
            website administrator if this problem persists.
          </Alert>
        }
      >
        <Suspense
          fallback={
            <div className="position-relative" style={{ minHeight: '300px' }}>
              <Loader message="Loading Survival Plot" />
            </div>
          }
        >
          {/* <SurvivalPlot /> */}
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
}
