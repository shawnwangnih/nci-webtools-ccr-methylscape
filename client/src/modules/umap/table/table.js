import { Container } from 'react-bootstrap';
import { useRecoilValue, useRecoilState, useResetRecoilState } from 'recoil';
import { tableData, selectedPoints } from './table.state';
import ReactTable from '../../components/table';
import { Suspense } from 'react';
import Alert from 'react-bootstrap/Alert';
import Loader from '../../components/loader';
import ErrorBoundary from '../../components/error-boundary';
import SurvivalPlot from './survivalPlot';
import { Form, Button } from 'react-bootstrap';

export default function Table() {
  const tables = useRecoilValue(tableData);
  const [state, setState] = useRecoilState(selectedPoints);
  const mergeState = (newState) => setState({ ...state, ...newState });
  const resetPoints = useResetRecoilState(selectedPoints);

  function handleChange(e) {
    mergeState({ selectedGroup: e.target.value });
  }

  return (
    <Container fluid>
      <p>
        Use Box or Lasso Select in the UMAP plot to view details for multiple
        samples.
      </p>

      <Form>
        {Object.keys(state.points).map((group, i) => (
          <Form.Check
            inline
            type="radio"
            label={`Group ${i + 1}`}
            name={group}
            id={group}
            value={group}
            checked={state.selectedGroup == group}
            onChange={handleChange}
          />
        ))}

        <Button onClick={resetPoints}>Reset</Button>
      </Form>
      {tables.map(
        (table, i) =>
          table.data &&
          table.data.length > 0 && (
            <>
              <div className="text-center">
                <b>Group {i + 1}</b>
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
        <Suspense fallback={<Loader message="Loading Survival Plot" />}>
          <SurvivalPlot />
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
}
