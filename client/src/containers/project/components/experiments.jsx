import React from "react";
import { Table, Input, Button, Form, Select } from "antd";

class Experiments extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      filterExperiment: "",
      filterDate: "",
      loading: true,
      pagination: {
        position: "bottom",
        size: 5,
        pageSize: 15
      },
      data: [],
      filteredData: []
    };
  }

  componentDidMount() {
    fetch("http://localhost:5000/api/project/experiments", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        projectID: this.state.projectID
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState({ experiments: data });
        this.setState({ filteredData: data });
        this.setState({ loading: false });
      });
  }

  handleFilter = () => {
    this.setState({
      filteredData: this.state.data.filter(row => {
        return row.project
          .toLowerCase()
          .includes(
            this.state.filterProject.toLowerCase(),
            this.state.filterInvestigator.toLowerCase(),
            );
      })
    });
  };

  render() {
    const columns = [
      {
        title: "Experiment",
        dataIndex: "experiment",
        sorter: true,
        width: "20%"
      },
      {
        title: "Date created",
        dataIndex: "date",
        sorter: true,
        width: "10%"
      },
      {
        title: "Investigator Name",
        dataIndex: "investigator",
        sorter: true,
        width: "10%"
      },
      {
        title: "# of samples",
        dataIndex: "sampleSize",
        sorter: true,
        width: "10%"
      },
      {
        title: "Experimental Worksheet",
        sorter: true,
        width: "20%",
        render: record => <a href="google.com">{record.key}</a>
      },
      {
        title: "Experiment Details",
        sorter: true,
        width: "20%",
        render: record => <a href="google.com">{record.key}</a>
      }
    ];

    const Option = Select.Option;
    const InputGroup = Input.Group;

    return (
      <div>
        <br></br>
        <div>
          <Form layout="inline">
            <Form.Item label="Experiment">
              <Input
                value={this.state.filterExperiment}
                onChange={e => this.setState({ filterExperiment: e.target.value })}
                placeholder="MethylScape"
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item label="Date">
              <Input
                value={this.state.filterDate}
                onChange={e =>
                  this.setState({ filterDate: e.target.value })
                }
                onPressEnter={this.handleFilter}
                placeholder="Jane Doe"
              />
            </Form.Item>
            <Form.Item>
              <Button icon="search" type="primary" onClick={this.handleFilter}>
                Search
              </Button>
            </Form.Item>
            <Form.Item label="Display">
              <InputGroup compact>
                <Select defaultValue="15">
                  <Option value="15">15</Option>
                  <Option value="25">25</Option>
                  <Option value="50">50</Option>
                  <Option value="75">75</Option>
                </Select>
              </InputGroup>
            </Form.Item>
            <span style={{ verticalAlign: "-webkit-baseline-middle" }}>
              of {this.state.data.length} results
            </span>
          </Form>
        </div>
        <br></br>
        <div>
        <Table
          {...this.state}
          columns={columns}
          dataSource={this.state.filteredData}
          onChange={this.handleTableChange}
        />
        </div>
       
      </div>
    );
  }
}
export default Experiments;
