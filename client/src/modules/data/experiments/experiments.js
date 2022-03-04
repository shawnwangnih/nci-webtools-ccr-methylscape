import { Container, Row, Col, Button } from 'react-bootstrap';
import { useRecoilValue } from 'recoil';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { Link, useSearchParams } from 'react-router-dom';
import { experimentsTableData } from './experiments.state';
import Table from '../../components/table';

export default function Experiments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tableData = useRecoilValue(experimentsTableData);

  const columns = [
    {
      id: 'project',
      accessor: 'project',
      Header: 'Project',
      Cell: (e) => (
        <Link to={'/data/projects?project=' + e.data[e.row.index].project}>
          {e.value}
        </Link>
      ),
    },
    {
      id: 'experiment',
      accessor: 'experiment',
      Header: 'Experiment',
      Cell: (e) => (
        <Link to={'/data/samples?experiment=' + e.data[e.row.index].experiment}>
          {e.value}
        </Link>
      ),
    },
    {
      id: 'investigator',
      accessor: 'investigator',
      Header: 'Investigator Name',
    },
    {
      id: 'samplesCount',
      accessor: 'samplesCount',
      Header: '# of Samples',
      Cell: (e) => (
        <Link to={'/data/samples?project=' + e.data[e.row.index].project}>
          {e.value}
        </Link>
      ),
    },
    {
      id: 'date',
      accessor: 'date',
      Header: 'Experiment Date',
    },
    {
      id: 'qcSheet',
      Header: 'QC Sheet',
      disableSortBy: true,
      Cell: ({ row }) => {
        const experiment = row.original.experiment;
        return (
          <Button
            variant="link"
            className="p-0"
            onClick={() => download(experiment, experiment + '.qcReport.pdf')}
          >
            View PDF
          </Button>
        );
      },
    },
    {
      id: 'qcSupplementary',
      Header: 'QC Supplementary',
      disableSortBy: true,
      Cell: ({ row }) => {
        const experiment = row.original.experiment;
        return (
          <Button
            variant="link"
            className="p-0"
            onClick={() =>
              download(experiment, experiment + '.supplementary_plots.pdf')
            }
          >
            View PDF
          </Button>
        );
      },
    },
  ];
  const options = {
    initialState: {
      filters: [
        { id: 'project', value: searchParams.get('project') || '' },
        { id: 'experiment', value: searchParams.get('experiment') || '' },
      ],
    },
  };

  async function download(experiment, file) {
    try {
      const response = await axios.post(
        `api/getFile`,
        {
          qc: experiment + '/' + file,
        },
        { responseType: 'blob' }
      );
      saveAs(response.data, file);
    } catch (err) {
      window.alert('File is unavailable');
      console.log(err);
    }
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          {tableData && tableData.length > 0 && (
            <Table data={tableData} columns={columns} options={options} />
          )}
        </Col>
      </Row>
    </Container>
  );
}
