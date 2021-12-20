import { Container, Row, Col, Button } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import { samplesTableData, samplesState } from "./samples.state";
import Table from "../components/table";

export default function Samples() {
  const tableData = useRecoilValue(samplesTableData);
  const [state, setState] = useRecoilState(samplesState);
  const mergeState = (newState) => setState({ ...state, ...newState });

  const columns = [
    {
      id: "sample_name",
      accessor: "sample_name",
      Header: "Sample Name",
      canFilter: true,
    },
    { id: "project", accessor: "project", Header: "Project", canFilter: true },
    {
      id: "experiment",
      accessor: "experiment",
      Header: "Experiment",
      canFilter: true,
    },
    {
      id: "pool_id",
      accessor: "pool_id",
      Header: "Sample Date",
      canFilter: true,
    },
    {
      id: "surgical_case",
      accessor: "surgical_case",
      Header: "Surgical Case",
      canFilter: true,
    },
    {
      id: "gender",
      accessor: "gender",
      Header: "Gender",
      canFilter: true,
    },
    {
      id: "age",
      accessor: "age",
      Header: "Age",
      canFilter: true,
    },
    {
      id: "diagnosis",
      accessor: "diagnosis",
      Header: "Diagnosis",
      canFilter: true,
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
