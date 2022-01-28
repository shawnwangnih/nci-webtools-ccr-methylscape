import { Container } from 'react-bootstrap';
import { useRecoilValue } from 'recoil';
import { tableData } from './table.state';
import ReactTable from '../../components/table';
import { Suspense } from 'react';
import Alert from 'react-bootstrap/Alert';
import Loader from '../../components/loader';
import ErrorBoundary from '../../components/error-boundary';
import SurvivalPlot from './survivalPlot';

export default function Table() {
  const { data, cols } = useRecoilValue(tableData);

  return (
    <Container fluid>
      <p>
        Use Box or Lasso Select in the UMAP plot to view details for multiple
        samples.
      </p>

      {data.length > 0 && (
        <ReactTable
          data={data}
          columns={cols}
          useHooks={{ hideColumns: true }}
        />
      )}

      <ErrorBoundary
        fallback={
          <Alert variant="danger">
            An internal error prevented plots from loading. Please contact the
            website administrator if this problem persists.
          </Alert>
        }
      >
        <Suspense fallback={<Loader message="Loading Survival Plot" />}>
          <SurvivalPlot />
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
}
