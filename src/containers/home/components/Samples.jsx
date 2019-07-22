import React from "react";
import { Table, Input, Button, Form, Select } from "antd";

class Samples extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterSample: "",
      filterProject:props.filter.project,
      filterSentrixID: "",
      loading: true,
      pagination: {
        position: "bottom",
        size: 5,
        // pageSize: 15,
        showSizeChanger: true
      },
      rawData: props.data,
      data: [],
      filteredData: []
    };
  }

  async componentWillReceiveProps(nextProps) {
    if(nextProps.filter.project){
      this.setState({filterProject: nextProps.filter.project},() =>{
        this.handleFilter();
      })
    }
  }

  async componentDidMount() {
    await this.createDataTable(this.state.rawData).then(
      this.setState({loading: false})
    )
  }

  createDataTable = async (rawData) => {
    var sampleData = {}
    sampleData = rawData.map( sample => {
      sample.key = sample.id
      var cp = sample.classifier_prediction
      sample.family = this.getMF(cp)
      sample.family_score = this.getMFScore(cp)
      sample.class = this.getMC(cp)
      sample.class_score = this.getMCScore(cp)
      return sample
    })
    this.setState({data: sampleData})
    this.setState({filteredData:  sampleData})
  }

  handleFilter = () => {
    this.setState({
      filteredData: this.state.data.filter(row => {
        return row.project.toLowerCase()
          .includes(this.getFilterProject());
      })
    });
  };

  getFilterProject = () => {
    return this.state.filterProject ? this.state.filterProject.toLowerCase() : ""
  }



  getMF = data => {
    return (Object.keys(data).length > 2) ? Object.keys(data["0"]) : ""
  }

  getMFScore = data => {
    return (Object.values(data).length > 2) ? Object.values(data["0"]) : ""
  }

  getMC = data => {
    const size = Object.keys(data).length
    if (size > 2) {
      return Object.keys(data["2"])[0]
    } else if (size == 2) {
      return Object.keys(data["1"])[0]
    } else {
      return ""
    }
  }

  getMCScore = data => {
    const size = Object.keys(data).length
    if (size > 2) {
      return Object.values(data["2"])[0]
    } else if (size == 2) {
      return Object.values(data["1"])[0]
    } else {
      return ""
    }
  }

  render() {
    const columns = [
      {
        title: "Sample Name",
        dataIndex: "sample_name",
        sorter: true,
        width: "300",
        fixed: 'left',
      },{
        title: "Project",
        dataIndex: "project",
        sorter: true,
        width: "300"
      },{
        title: "Experiment",
        dataIndex: "experiment",
        sorter: true,
        width: "300",
        render: (text, record) => <a onClick={() => this.props.changeTab("experiments", {project:record.project})}>{text}</a>
      },{
        title: "Date",
        dataIndex: "date",
        sorter: true,
        width: "200"
      },{
        title: "Surgical Case",
        dataIndex: "surgical_case",
        sorter: true,
        width: "200"
      },{
        title: "Gender",
        dataIndex: "gender",
        sorter: true,
        width: "200"
      },{
        title: "Age",
        dataIndex: "age",
        sorter: true,
        width: "200"
      },{
        title: "Diagnosis",
        dataIndex: "diagnosis",
        sorter: true,
        width: "200"
      },{
        title: "Methylation Family (MF)",
        dataIndex: "family",
        sorter: true,
        width: "200",
      },{
        title: "MF Calibrated Scores",
        dataIndex: "family_score",
        sorter: true,
        width: "200"
      },{
        title: "Methylation Class (MC)",
        dataIndex: "class",
        sorter: true,
        width: "200"
      },{
        title: "MC Calibrated Scores",
        dataIndex: "class_score",
        sorter: true,
        width: "200"
      },{
        title: "MGMT status",
        dataIndex: "mgmt_prediction.Status",
        sorter: true,
        width: "200"
      },{
        title: "MGMT score",
        dataIndex: "mgmt_prediction.Estimated",
        sorter: true,
        width: "200"
      },{
        title: "t-SNE plot",
        dataIndex: "",
        sorter: true,
        width: "200",
        render: record => <a href="...">link to html</a>
      },{
        title: "NGS reports (pdf-files)",
        dataIndex: "",
        sorter: true,
        width: "200",
        render: record => <a href="...">link to pdf</a>
      },{
        title: "Slide Image",
        dataIndex: "",
        sorter: true,
        width: "200",
        render: record => <a href="...">link to image file</a>
      },{
        title: "Notes",
        dataIndex: "notes",
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
          <Form.Item label="Project">
              <Input
                value={this.state.filterProject}
                onChange={e =>
                  this.setState({ filterProject: e.target.value })
                }
                placeholder="MethylScape"
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
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
            scroll={{ x: 3500 }}
          />
        </div>
      </div>
    );
  }
}
export default Samples;
