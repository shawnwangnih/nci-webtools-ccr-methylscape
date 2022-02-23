import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import { useRecoilState } from 'recoil';
import { formState } from './copyNumber.state';

export default function CopyNumberForm() {
  const [state, setState] = useRecoilState(formState);

  const radios = [
    { name: 'None', value: 'none' },
    { name: 'Breakpoint Genes', value: 'breakpoint' },
    { name: 'Amp/Del', value: 'ampdel' },
  ];

  return (
    <ButtonGroup className="mb-3">
      {radios.map((radio, idx) => (
        <ToggleButton
          key={idx}
          id={`radio-${idx}`}
          type="radio"
          variant="outline-primary"
          name="radio"
          value={radio.value}
          checked={state.annotation === radio.value}
          onChange={(e) => setState({ annotation: radio.value })}
        >
          {radio.name}
        </ToggleButton>
      ))}
    </ButtonGroup>
  );
}
