import { Button, Tabs, Tab } from 'react-bootstrap';
import { useRecoilState, useResetRecoilState, useRecoilValue } from 'recoil';
import { tableForm, tableData } from './table.state';
import ReactTable from '../../components/table';
import { selectedPoints } from '../metadata/metadata-plot.state';

export default function TableTabs() {
  const [formState, setState] = useRecoilState(tableForm);
  const setForm = (newState) => setState({ ...formState, ...newState });
  const resetForm = useResetRecoilState(tableForm);
  const resetPoints = useResetRecoilState(selectedPoints);
  const tables = useRecoilValue(tableData);
  const [umapPoints, setUmapPoints] = useRecoilState(selectedPoints);

  function handleSelect(e) {
    setForm({ group: e });
  }

  function addTab() {
    const points = umapPoints.points;
    if (points.length < 3)
      setUmapPoints({ ...umapPoints, points: [...points, []] });
  }

  function removeTab(index) {
    let points = umapPoints.points.slice();
    if (points.length > 1) {
      points.splice(index, 1);
      setUmapPoints({ ...umapPoints, points });
    }
  }

  return (
    <div>
      <Button size="sm" variant="success" onClick={addTab}>
        + Group
      </Button>
      <Button
        size="sm"
        variant="outline-secondary"
        onClick={() => {
          resetForm();
          resetPoints();
        }}
        className="ms-3"
      >
        Reset
      </Button>

      <Tabs
        id="controlled-tab-example"
        activeKey={formState.group}
        onSelect={handleSelect}
        className="mb-3"
      >
        {umapPoints.points.map((_, i) => {
          const { data, cols } = tables[i];

          return (
            <Tab eventKey={`${i}`} title={`Group ${i + 1}`}>
              {i > 0 && (
                <div className="d-flex">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => removeTab(i)}
                    className="ms-auto mb-3"
                  >
                    - Group
                  </Button>
                </div>
              )}
              {data.length ? (
                <ReactTable
                  data={data}
                  columns={cols}
                  useHooks={{ hideColumns: true }}
                />
              ) : (
                <p>
                  Use Box or Lasso Select in the UMAP plot to view details for
                  multiple samples.
                </p>
              )}
            </Tab>
          );
        })}
      </Tabs>
    </div>
  );
}
