import { Form, Button } from 'react-bootstrap';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { tableForm } from './table.state';

export default function TableForm() {
  const [state, setState] = useRecoilState(tableForm);
  const mergeState = (newState) => setState({ ...state, ...newState });
  const resetPoints = useResetRecoilState(tableForm);

  function handleChange(e) {
    mergeState({ selectedGroup: e.target.value });
  }

  return (
    <div>
      <p>
        Use Box or Lasso Select in the UMAP plot to view details for multiple
        samples.
      </p>

      <Form>
        <Form.Check
          inline
          type="radio"
          label={`Group 1`}
          name={'group_1'}
          id={'group_1'}
          value={'group_1'}
          checked={state.selectedGroup == 'group_1'}
          onChange={handleChange}
        />
        <Form.Check
          inline
          type="radio"
          label={`Group 2`}
          name={'group_2'}
          id={'group_2'}
          value={'group_2'}
          checked={state.selectedGroup == 'group_2'}
          onChange={handleChange}
        />
        <Form.Check
          inline
          type="radio"
          label={`Group 3`}
          name={'group_3'}
          id={'group_3'}
          value={'group_3'}
          checked={state.selectedGroup == 'group_3'}
          onChange={handleChange}
        />

        <Button onClick={resetPoints}>Reset</Button>
      </Form>
    </div>
  );
}
