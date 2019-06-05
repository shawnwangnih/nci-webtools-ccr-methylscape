import React from "react";
import { Table, Input, Button, Form, Select } from "antd";

class Samples extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      filterSample: "",
      filterSentrixID: "",
      loading: true,
      pagination: {
        position: "bottom",
        size: 5,
        // pageSize: 15,
        showSizeChanger: true
      },
      data: [],
      filteredData: []
    };
  }

  componentDidMount() {
    fetch("http://localhost:5000/api/project/samples", {
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
        return row.project.toLowerCase()
          .includes(this.state.filterExperiment.toLowerCase());
      })
    });
  };

  render() {
    const columns = [
      {
        title: "Sample Name",
        dataIndex: "",
        sorter: true,
        width: "200",
        fixed: 'left',
      },{
        title: "Project",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Surgical Case",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Gender",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Age",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Diagnosis",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Methylation Family",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "MF Calibrated Scores",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "t-SNE plot",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Sequencing report",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Sentrix ID",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "notes",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Sample well",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Sample group",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Pool ID",
        dataIndex: "",
        sorter: true,
        width: "200"
      },{
        title: "Material Type",
        dataIndex: "",
        sorter: true,
        width: "200"
      }
      
    ];

    const Option = Select.Option;
    const InputGroup = Input.Group;

    return (
      <div>
        <br />
        <div>
          <Form layout="inline">
            <Form.Item label="Sample">
              <Input
                value={this.state.filterSample}
                onChange={e =>
                  this.setState({ filterSample: e.target.value })
                }
                placeholder="Sample"
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item label="Sentrix ID">
              <Input
                value={this.state.filterSentrixID}
                onChange={e => this.setState({ filterSentrixID: e.target.value })}
                onPressEnter={this.handleFilter}
                placeholder="ABD123"
              />
            </Form.Item>
            <Form.Item>
              <Button icon="search" type="primary" onClick={this.handleFilter}>
                Search
              </Button>
            </Form.Item>
          </Form>
        </div>
        <br />
        <div>
          <Table
            {...this.state}
            columns={columns}
            dataSource={this.state.filteredData}
            onChange={this.handleTableChange}
            scroll={{ x: 2100 }}
          />
        </div>
      </div>
    );
  }
}
export default Samples;
