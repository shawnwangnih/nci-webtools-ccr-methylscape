import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CreatableSelect from 'react-select/creatable';
import { useRecoilState } from 'recoil';
import { formState, preFormState } from './copyNumber.state';

export default function CopyNumberForm() {
  const [form, setForm] = useRecoilState(formState);
  const [preForm, setPreForm] = useRecoilState(preFormState);
  const mergeForm = (state) => setForm({ ...form, ...state });

  function handleSearch(e) {
    mergeForm({ search: e });
  }

  return (
    <Row>
      <Col sm="auto" className="d-flex">
        <Form.Group controlId="plotSignificant" className="my-auto">
          <Form.Check
            label="Significant"
            type="switch"
            name="plotSignificant"
            checked={preForm.significant}
            onChange={() => setPreForm({ significant: !preForm.significant })}
          />
        </Form.Group>
      </Col>
      <Col sm="auto" className="d-flex">
        <Form.Group controlId="toggleAnnotations" className="my-auto">
          <Form.Check
            label="Annotations"
            type="switch"
            name="toggleAnnotations"
            checked={form.annotations}
            onChange={() =>
              setForm({ ...form, annotations: !form.annotations })
            }
          />
        </Form.Group>
      </Col>
      <Col>
        <Form.Group id="copy-number-search" className="mb-3">
          <Form.Label>Search</Form.Label>
          <CreatableSelect
            name="copy-number-search"
            noOptionsMessage={() => null}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            formatCreateLabel={(userInput) => `Gene(s): ${userInput}`}
            isMulti
            placeholder="Gene(s)"
            value={form.search}
            onChange={handleSearch}
          />
        </Form.Group>
      </Col>
    </Row>
  );
}
