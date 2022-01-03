import { useRecoilValue } from 'recoil';
import { overviewState } from './overview.state';

export default function Info() {
  let { samples, studies, institutions } = useRecoilValue(overviewState);

  return (
    <div>
      samples: {samples} studies: {studies} institutions: {institutions}
    </div>
  );
}
