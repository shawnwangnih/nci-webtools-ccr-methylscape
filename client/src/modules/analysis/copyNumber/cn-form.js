import { ButtonGroup, ToggleButton, Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CreatableSelect from 'react-select/creatable';
import { useRecoilState } from 'recoil';
import { formState } from './copyNumber.state';

export default function CopyNumberForm() {
  const [form, setForm] = useRecoilState(formState);
  const mergeForm = (state) => setForm({ ...form, ...state });

  const radios = [
    { name: 'None', value: 'none' },
    { name: 'Annotations', value: 'annotations' },
  ];

  function handleToggle(e) {
    mergeForm({ annotation: e });
  }

  function handleSignificant(e) {
    mergeForm({ significant: !form.significant });
  }

  function handleSearch(e) {
    mergeForm({ search: e });
  }

  return (
    <Row>
      <Col sm="auto" className="d-flex">
        <ButtonGroup className="mt-auto mb-3">
          {radios.map((radio, idx) => (
            <ToggleButton
              key={idx}
              id={`radio-${idx}`}
              type="radio"
              variant="outline-primary"
              name="radio"
              value={radio.value}
              checked={form.annotation === radio.value}
              onChange={() => handleToggle(radio.value)}
            >
              {radio.name}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </Col>
      <Col sm="auto" className="d-flex">
        <Form.Group controlId="plotSignificant" className="my-auto">
          <Form.Check
            label="Significant"
            type="switch"
            name="plotSignificant"
            checked={form.significant}
            onChange={handleSignificant}
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
