import { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { projectsTableData, projectState } from "./projects.state";
import Table from "../../components/table";
import Summary from "./summary";

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  console.log(projectsTableData);
  const tableData = useRecoilValue(projectsTableData);
  const [state, setState] = useRecoilState(projectState);
  const mergeState = (newState) => setState({ ...state, ...newState });

  const { selectedProject } = state;

  const columns = [
    { id: "project", accessor: "project", Header: "Project" },
    {
      id: "investigator",
      accessor: "investigator",
      Header: "Investigator Name",
    },
    {
      id: "experimentsCount",
      accessor: "experimentcount",
      Header: "# of Experiments",
    },
    {
      id: "samplesCount",
      accessor: "samplecount",
      Header: "# of Samples",
      Cell: (e) => <Link to={"../samples?project=" + e.data[e.row.index].project}>{e.value}</Link>,
    },
  ];
  const options = {
    initialState: {
      selectedRowIds: { 0: true },
      filters: [{ id: "project", value: searchParams.get("project") || "" }],
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

  // set inital selected project
  useEffect(() => {
    if (!selectedProject && tableData.length) {
      mergeState({ selectedProject: tableData[0].project });
    }
  }, [selectedProject, tableData]);

  return (
    <Container fluid>
      <Row>
        <Col>
          {tableData.length > 0 && (
            <Table data={tableData} columns={columns} options={options} customOptions={{ rowSelectRadio: true }} />
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
