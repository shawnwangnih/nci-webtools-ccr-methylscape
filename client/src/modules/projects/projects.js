import { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { tableState } from "./projects.state";
import Table from "../components/table";
import { methylscapeData } from "../data/data.state";
import Summary from "./summary";

export default function Projects() {
  const dbData = useRecoilValue(methylscapeData);
  const [table, setTable] = useRecoilState(tableState);
  const mergeState = (state) => setTable({ ...table, ...state });

  const { tableData } = table;

  const columns = [
    { id: "project", accessor: "project", Header: "Project", canFilter: true },
    {
      id: "investigator",
      accessor: "investigator",
      Header: "Investigator Name",
      canFilter: true,
    },
    {
      id: "experimentsCount",
      accessor: "experimentsCount",
      Header: "# of Experiments",
      canFilter: true,
      Cell: (e) => (
        <Link key={"/experiments"} to={"/experiments"}>
          {e.data[e.row.index].experiments.size}
        </Link>
      ),
    },
    {
      id: "samplesCount",
      accessor: "samplesCount",
      Header: "# of Samples",
      canFilter: true,
    },
  ];
  const options = {
    initialState: {
      selectedRowIds: { 0: true },
    },
    stateReducer: (newState, action) => {
      // Allow only one row to be selected at a time
      if (action.type === "toggleRowSelected") {
        newState.selectedRowIds = {
          [action.id]: true,
        };

        mergeState({ selectedProject: tableData[action.id].project });
      }
      return newState;
    },
  };

  useEffect(() => {
    if (dbData.length && !tableData.length) {
      let projects = [];
      dbData.forEach((sample) => {
        const curProject = sample.project;
        if (curProject && sample.experiment) {
          if (curProject in projects) {
            projects[curProject].samplesCount += 1;
            projects[curProject].experiments.add(sample.experiment);
          } else {
            projects[curProject] = {
              project: curProject,
              samplesCount: 1,
              date: sample.date,
              investigator: sample.investigator,
              experiments: new Set([]),
            };
            projects[curProject].experiments.add(sample.experiment);
          }
        }
      });

      const tableData = Object.values(projects);
      mergeState({ tableData, selectedProject: tableData[0].project });
    }
  }, [dbData]);

  return (
    <Container fluid>
      <Row>
        <Col>
          {tableData.length > 0 && (
            <Table
              data={tableData}
              columns={columns}
              options={options}
              useHooks={{ rowSelect: true }}
            />
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <Summary />
        </Col>
      </Row>
    </Container>
  );
}
