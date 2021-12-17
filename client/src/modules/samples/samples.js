import { useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import { tableState } from "./samples.state";
import Table from "../components/table";
import { methylscapeData } from "../data/data.state";

export default function Samples() {
  const dbData = useRecoilValue(methylscapeData);
  const [table, setTable] = useRecoilState(tableState);
  const mergeState = (state) => setTable({ ...table, ...state });

  const { tableData } = table;

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

  useEffect(() => {
    //returns the methylation family if it exists
    function getMF(data) {
      return Object.keys(data).length >= 2
        ? String(Object.keys(data["0"])[0]).substring(25)
        : "";
    }

    //returns the methylation family score if it exists
    function getMFScore(data) {
      return Object.values(data).length >= 2 ? Object.values(data["0"]) : "";
    }

    //returns the methylation class
    function getMC(data) {
      const size = Object.keys(data).length;
      if (size >= 2) {
        return Object.keys(data["1"])[0];
      } else if (size === 1) {
        return Object.keys(data["0"])[0];
      } else {
        return "";
      }
    }

    //returns the methylation class score
    function getMCScore(data) {
      const size = Object.keys(data).length;
      if (size >= 2) {
        return Object.values(data["1"])[0];
      } else if (size === 1) {
        return Object.values(data["0"])[0];
      } else {
        return "";
      }
    }

    if (dbData.length && !tableData.length) {
      const samples = dbData
        .filter(({ sample_name }) => sample_name)
        .map((sample) => {
          const cp = sample.classifier_prediction;
          if (!cp) {
            return {
              ...sample,
              family: "",
              family_score: "",
              class: "",
              class_score: "",
            };
          } else {
            return {
              ...sample,
              family: getMF(cp),
              family_score: getMFScore(cp),
              class: getMC(cp),
              class_score: getMCScore(cp),
            };
          }
        });

      mergeState({ tableData: Object.values(samples) });
    }
  }, [dbData]);

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
