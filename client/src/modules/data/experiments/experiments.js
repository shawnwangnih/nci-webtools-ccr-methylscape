import { Container, Row, Col, Button } from "react-bootstrap";
import { useRecoilValue } from "recoil";
import { experimentsTableData } from "./experiments.state";
import Table from "../../components/table";

export default function Experiments() {
  const tableData = useRecoilValue(experimentsTableData);

  const columns = [
    { id: "project", accessor: "project", Header: "Project", canFilter: true },
    {
      id: "experiment",
      accessor: "experiment",
      Header: "Experiment",
      canFilter: true,
    },
    {
      id: "investigator",
      accessor: "investigator",
      Header: "Investigator Name",
      canFilter: true,
    },
    {
      id: "samplesCount",
      accessor: "samplesCount",
      Header: "# of Samples",
      canFilter: true,
    },
    {
      id: "date",
      accessor: "date",
      Header: "Experiment Date",
      canFilter: true,
    },
    {
      id: "qcSheet",
      Header: "QC Sheet",
      disableSortBy: true,
      Cell: ({ row }) => {
        const experiment = row.original.experiment;
        return (
          <Button
            variant="link"
            className="p-0"
            onClick={() => download(experiment, experiment + ".qcReport.pdf")}>
            View PDF
          </Button>
        );
      },
    },
    {
      id: "qcSupplementary",
      Header: "QC Supplementary",
      disableSortBy: true,
      Cell: ({ row }) => {
        const experiment = row.original.experiment;
        return (
          <Button
            variant="link"
            className="p-0"
            onClick={() =>
              download(experiment, experiment + ".supplementary_plots.pdf")
            }>
            View PDF
          </Button>
        );
      },
    },
  ];
  const options = {};

  async function download(experiment, file) {
    try {
      const response = await fetch(`api/getFile`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qc: experiment + "/" + file,
        }),
      });

      if (!response.ok) {
        window.alert("File is unavailable");
      } else {
        const url = URL.createObjectURL(await response.blob());
        window.open(url, "_blank");
        URL.revokeObjectURL(url);
      }
    } catch (err) {
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
