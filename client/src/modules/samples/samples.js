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
      id: "data",
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

  useEffect(() => {
    if (dbData.length && !tableData.length) {
      let experiments = [];
      dbData.forEach((sample) => {
        const curExperiment = sample.experiment;
        if (curExperiment) {
          if (curExperiment in experiments) {
            experiments[curExperiment].samplesCount =
              experiments[curExperiment].samplesCount + 1;
          } else {
            experiments[curExperiment] = {
              experiment: curExperiment,
              project: sample.project,
              samplesCount: 1,
              date: sample.date,
              investigator: sample.investigator,
            };
          }
        }
      });

      const tableData = Object.values(experiments);
      mergeState({ tableData });
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
