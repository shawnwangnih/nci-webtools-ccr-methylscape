import { Suspense } from 'react';
import Alert from 'react-bootstrap/Alert';
import Loader from '../../components/loader';
import ErrorBoundary from '../../components/error-boundary';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CopyNumberPlot from './cnPlot';

export default function CopyNumber() {
  return (
    <div className="px-3">
      <b>Genome-wide Copy Number</b>
      <p>
        To view sample-level quality control metrics, click on a point in the
        embedding (please allow approximately 4-5 seconds for the data to be
        displayed after clicking a sample). The summary data and plots are
        generated during functional normalization of the methylation signal
        intensities. It is important to assess both sample and probe quality
        prior to interpretatin of a case.
      </p>
      <ErrorBoundary
        fallback={
          <Alert variant="danger">
            An internal error prevented plots from loading. Please contact the
            website administrator if this problem persists.
          </Alert>
        }
      >
        <Suspense fallback={<Loader message="Loading CN" />}>
          <CopyNumberPlot />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
