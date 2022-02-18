import { useRecoilValue } from 'recoil';
import Plot from 'react-plotly.js';
import ReactTable from '../../components/table';
import { survivalDataSelector } from './table.state';
import { getSurvivalPlot, getSummaryColumns } from './survival-plot.utils';

export default function SurvivalPlot() {
  const survivalData = useRecoilValue(survivalDataSelector);
  const survivalPlot = getSurvivalPlot(survivalData?.data);
  const summaryTableColumns = getSummaryColumns(survivalData?.summary);
  
  return (
    <>
      <Plot {...survivalPlot} />
      {survivalData?.pValue[0]?.pval && <div className="mb-2">
        <strong>p-value: </strong>
        {survivalData.pValue[0].pval}
      </div>}

      <h3 className='h5'>Number at Risk</h3>
      <ReactTable
        data={survivalData?.summary || []}
        columns={summaryTableColumns}
      />
    </>
  );
}
