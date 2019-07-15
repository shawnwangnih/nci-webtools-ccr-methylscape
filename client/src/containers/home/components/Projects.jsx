import React from "react";
import { Link } from "react-router-dom";
import { Table, Input, Button, Form, Select, PageHeader } from "antd";


class Projects extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterProject: "",
      filterInvestigator: "",
      loading: true,
      pagination: {
        position: "bottom",
        size: 5,
        showSizeChanger: true
      },
      data: [],
      filteredData: []
    };
  }

  async componentWillReceiveProps(props) {
    await this.createDataTable(props.data).then(
      this.setState({loading: false})
    )
  }

  createDataTable = async(rawData) => {
    var projectData = {}
    rawData.map( sample => {
      var curProject = sample.project
      if(curProject == null) {
      }
      else if(curProject in projectData){
        projectData[curProject].sampleSize = projectData[curProject].sampleSize + 1
        projectData[curProject].experiments.add(sample.experiment)
      }else{
        projectData[curProject] = {
          key: curProject,
          project: curProject,
          sampleSize: 1,
          date: sample.date,
          investigator: sample.investigator,
          experiments: new Set([])
        }
        projectData[curProject].experiments.add(sample.experiment)
      }
    })
    this.setState({data: Object.values(projectData)})
    this.setState({filteredData:  Object.values(projectData)})
  };

  handleFilter = () => {
    this.setState({
      filteredData: this.state.data.filter(row => {
        return row.project.toLowerCase()
                .includes(this.state.filterProject.toLowerCase()) &&
              row.investigator.toLowerCase()
                .includes(this.state.filterInvestigator.toLowerCase())
      })
    });
  };

  render() {
    const columns = [
      {
        title: "Project",
        dataIndex: "key",
        sorter: true,
        width: "20%",
        render: (text, record) => <Link to={`/TEMP/${record.project}`}>{record.project}</Link>
      },{
        title: "Investigator Name",
        dataIndex: "investigator",
        sorter: true,
        width: "20%"
      },{
        title: "# of Experiments",
        dataIndex: "experiments",
        sorter: true,
        width: "20%",
        render: (text, record) => <a onClick={() => this.props.changeTab("experiments", {project:record.project})}>{record.experiments.size}</a>
      },{
        title: "# of Samples",
        dataIndex: "sampleSize",
        sorter: true,
        width: "20%",
        render: (text, record) => <a onClick={() => this.props.changeTab("samples")}>{text}</a>
      },{
        title: "Project Date",
        dataIndex: "date",
        sorter: true,
        width: "15%"
      },
    ];

    return (
      <div>
        <div>
        {/* <PageHeader title={"MethylScape Results"} /> */}
        <br></br>
          <Form layout="inline">
            <Form.Item label="Project">
              <Input
                value={this.state.filterProject}
                onChange={e => this.setState({ filterProject: e.target.value })}
                placeholder="MethylScape"
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item label="Investigator">
              <Input
                value={this.state.filterInvestigator}
                onChange={e => this.setState({ filterInvestigator: e.target.value })}
                onPressEnter={this.handleFilter}
                placeholder="Jane Doe" />
            </Form.Item>
            <Form.Item>
              <Button icon="search" type="primary" onClick={this.handleFilter}>
                Search
              </Button>
            </Form.Item>
          </Form>
        </div>
        <br />
        <Table
          {...this.state}
          columns={columns}
          dataSource={this.state.filteredData}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}
export default Projects;
