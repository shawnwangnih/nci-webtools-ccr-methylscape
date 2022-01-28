import { useRecoilValue } from 'recoil';
import { survivalPlot } from './table.state';

export default function SurvivalPlot() {
  const { path, uncaughtError } = useRecoilValue(survivalPlot);
  return path ? (
    <img
      src={'api/results/' + path}
      alt="os survival plot"
      style={{ maxWidth: '100%' }}
    ></img>
  ) : uncaughtError ? (
    <p>There was a problem generating the surival plot</p>
  ) : (
    ''
  );
}
