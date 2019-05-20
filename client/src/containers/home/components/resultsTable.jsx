import React from "react";
import { Link } from "react-router-dom";
import { Table, Input, Button, Form, Select, PageHeader } from "antd";


class resultsTable extends React.Component {
  constructor() {
    super();
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

  createDataTable = indexData => {
    var data = [];
    // experiment will be a unqie key, Key is nessecary
    var tempKey = 1;
    for (var file in indexData) {
      var cur = {};
      console.log(indexData[file]["metaData"]);
      cur = indexData[file]["metaData"];
      cur["key"] = indexData[file]["metaData"]["experiment"] + tempKey;
      tempKey++;
      data = [...data, cur];
    }
    console.log(data);
    this.setState({ data });
    this.setState({ filteredData: data });
  };

  componentDidMount() {
    fetch("http://localhost:5000/api/methylScapeIndexFile")
      .then(res => res.json())
      .then(data => {
        // console.log(data)
        // this.setState({data})
        this.createDataTable(data);
        this.setState({ loading: false });
      });
  }

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
        dataIndex: "project",
        sorter: true,
        width: "20%",
        render: (text, record) => <Link to={`/project-page/${record.project}`}>{record.project}</Link>
      },
      {
        title: "Investigator Name",
        dataIndex: "investigator",
        sorter: true,
        width: "20%"
      },
      {
        title: "# of samples",
        dataIndex: "sampleSize",
        sorter: true,
        width: "20%"
      },
      {
        title: "Date",
        dataIndex: "date",
        sorter: true,
        width: "15%"
      },
      {
        title: "Summary Stats",
        sorter: true,
        width: "20%",
        render: record => <a href="google.com">{record.key}</a>
      }
    ];
    
    return (
      <div>
        <div>
        <PageHeader title={"MethylScape Results"} />
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
export default resultsTable;
