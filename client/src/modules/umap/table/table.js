import { Container } from 'react-bootstrap';
import { useRecoilValue } from 'recoil';
import { tableData } from './table.state';
import ReactTable from '../../components/table';
import { Suspense } from 'react';
import Alert from 'react-bootstrap/Alert';
import Loader from '../../components/loader';
import ErrorBoundary from '../../components/error-boundary';
import SurvivalPlot from './survival-plot';
import TableForm from './table-form';

export default function Table() {
  const tables = useRecoilValue(tableData);

  return (
    <Container fluid>
      <TableForm />
      {tables.map(
        (table, i) =>
          table.data &&
          table.data.length > 0 && (
            <>
              <div className="text-center">
                <b>{table.name}</b>
              </div>
              <ReactTable
                data={table.data}
                columns={table.cols}
                useHooks={{ hideColumns: true }}
              />
            </>
          )
      )}
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
          <SurvivalPlot />
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
}
