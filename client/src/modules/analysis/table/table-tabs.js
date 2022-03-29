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
    let points = umapPoints.points.slice();
    if (points.length < 3) {
      points = [...points, []];
      setUmapPoints({ ...umapPoints, points });
      setForm({ group: points.length - 1 });
    }
  }

  function removeTab(index) {
    let points = umapPoints.points.slice();
    if (points.length > 1) {
      points.splice(index, 1);
      setUmapPoints({ ...umapPoints, points });
      setForm({ group: points.length - 1 });
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
      {formState.group != 0 && (
        <Button
          size="sm"
          variant="danger"
          onClick={() => removeTab(formState.group)}
          className="ms-3"
        >
          - Group
        </Button>
      )}
      <Tabs
        id="controlled-tab-example"
        activeKey={formState.group}
        onSelect={handleSelect}
        className="mb-3"
      >
        {umapPoints.points.map((_, i) => {
          const { data, cols } = tables[i];

          return (
            <Tab
              key={`table_tab_${i}`}
              eventKey={`${i}`}
              title={`Group ${i + 1}`}
            >
              {data.length ? (
                <ReactTable
                  data={data}
                  columns={cols}
                  options={{
                    initialState: {
                      hiddenColumns: cols
                        .filter((col) => col.show === false)
                        .map((col) => col.accessor),
                    },
                  }}
                  customOptions={{
                    hideColumns: true,
                    download: `Group_${i + 1}_data.csv`,
                  }}
                />
              ) : (
                <div className="d-flex bg-light" style={{ minHeight: '300px' }}>
                  <p className="mx-auto my-auto">
                    Use Box or Lasso Select in the UMAP plot to view details for
                    multiple samples.
                  </p>
                </div>
              )}
            </Tab>
          );
        })}
      </Tabs>
    </div>
  );
}
