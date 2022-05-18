import { useRecoilState } from 'recoil';
import { formState } from './metadata-plot.state';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MultiSearch from '../../components/multi-search';
import GroupSelect from '../../components/group-select';

export default function MetadataForm({ className, onSelect }) {
  const [form, setForm] = useRecoilState(formState);
  const mergeForm = (state) => setForm({ ...form, ...state });

  function handleChange(event) {
    let { name, value, checked, type } = event.target;
    mergeForm({
      [name]: type === 'checkbox' ? checked : value,
    });
  }

  function handleSearch(e) {
    mergeForm({ search: e });
  }

  const colorOptions = [
    {
      label: 'Categorical',
      options: [
        { label: 'NCI Metric', value: 'nciMetric', type: 'categorical' },
        { label: 'Sex', value: 'sex', type: 'categorical' },
      ],
    },
    {
      label: 'Continuous',
      options: [
        {
          label: 'RF Purity (Absolute)',
          value: 'rfPurityAbsolute',
          type: 'continuous',
          dtick: 0.05,
        },
        { label: 'Age', value: 'age', type: 'continuous', dtick: 5 },
      ],
    },
  ];

  return (
    <Form className={className}>
      <Row>
        <Col md="auto">
          <Form.Group id="organSystem" className="form-group mb-3">
            <Form.Label>Organ System</Form.Label>
            <Form.Select
              name="organSystem"
              value={form.organSystem}
              onChange={handleChange}
              className="source"
            >
              <option value="centralNervousSystem">
                Central Nervous System
              </option>
              <option value="boneAndSoftTissue">Bone and Soft Tissue</option>
              <option value="hematopoietic">Hematopoietic</option>
              <option value="renal">Renal</option>
              <option value="panCancer">Pan-Cancer</option>
            </Form.Select>
            {/* <DropdownButton
              name="organSystem"
              value={form.organSystem}
              onClick={handleChange}
              className="source"
              title="Select"
            >
              <Dropdown.Item value="centralNervousSystem">
                Central Nervous System
              </Dropdown.Item>
              <Dropdown.Item value="boneAndSoftTissue">
                Bone and Soft Tissue
              </Dropdown.Item>
              <Dropdown.Item value="hematopoietic">Hematopoietic</Dropdown.Item>
              <Dropdown.Item value="renal">Renal</Dropdown.Item>
              <Dropdown.Item value="panCancer">Pan-Cancer</Dropdown.Item>
            </DropdownButton> */}
          </Form.Group>
        </Col>
        <Col md="auto">
          <Form.Group id="embedding" className="mb-3">
            <Form.Label>Embedding</Form.Label>
            <Form.Select
              name="embedding"
              value={form.embedding}
              onChange={handleChange}
            >
              <option>umap</option>
              <option>densmap</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group id="color" className="mb-3">
            <Form.Label>Color By</Form.Label>
            <GroupSelect
              name="color"
              defaultValue={colorOptions[0].options[0]}
              options={colorOptions}
              onChange={(e) => mergeForm({ color: e })}
            />
          </Form.Group>
        </Col>
        <Col md="3">
          <Form.Group id="search" className="mb-3">
            <Form.Label>Search</Form.Label>
            <MultiSearch
              name="search"
              placeholder="Sample"
              value={form.search}
              onChange={handleSearch}
            />
          </Form.Group>
        </Col>
        <Col md="auto">
          <Form.Group controlId="showAnnotations" className="mb-3">
            <Form.Check
              label="Show Weekly Updates"
              type="switch"
              name="showAnnotations"
              checked={form.showAnnotations}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
}
