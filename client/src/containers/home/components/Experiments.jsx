import React from "react";
import { Link } from "react-router-dom";
import { Table, Input, Button, Form, Select } from "antd";

class Experiments extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filterExperiment: "",
      filterDate: "",
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

  async componentDidMount() {
    await this.createDataTable(this.state.rawData).then(
      this.setState({loading: false})
    )
  }

  createDataTable = async (rawData) => {
    var experimentData = {}
    rawData.map( sample => {
      var curExperiment = sample.experiment
      if(curExperiment == null) {
      }
      else if(curExperiment in experimentData){
        experimentData[curExperiment].sampleSize = experimentData[curExperiment].sampleSize + 1
      }else{
        experimentData[curExperiment] = {
          key: curExperiment,
          project:  sample.project,
          sampleSize: 1,
          date: sample.date,
          investigator: sample.investigator,
          experiment: curExperiment
        }
      }
    })
    this.setState({data: Object.values(experimentData)})
    this.setState({filteredData:  Object.values(experimentData)})
  }



  handleFilter = () => {
    this.setState({
      filteredData: this.state.data.filter(row => {
        return row.project.toLowerCase()
          .includes(this.state.filterExperiment.toLowerCase());
      })
    })
  }

  render() {
    const columns = [
      {
        title: "Project",
        dataIndex: "key",
        sorter: true,
        width: "20%",
        render: (text, record) => <Link to={`/TEMP/${record.project}`}>{record.project}</Link>
      },{
        title: "Experiment",
        dataIndex: "experiment",
        sorter: true,
        width: "20%"
      },
      {
        title: "Investigator Name",
        dataIndex: "investigator",
        sorter: true,
        width: "10%"
      },
      {
        title: "Date created",
        dataIndex: "date",
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
        title: "QC Sheet",
        sorter: true,
        width: "20%",
        render: record => <a href="...">show detials</a>
      },
      {
        title: "QC supplementary",
        sorter: true,
        width: "20%",
        render: record => <a href="...">show detials</a>
      }
    ];

    const Option = Select.Option;
    const InputGroup = Input.Group;

    return (
      <div>
        <br />
        <div>
          <Form layout="inline">
            <Form.Item label="Experiment">
              <Input
                value={this.state.filterExperiment}
                onChange={e =>
                  this.setState({ filterExperiment: e.target.value })
                }
                placeholder="MethylScape"
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item label="Date">
              <Input
                value={this.state.filterDate}
                onChange={e => this.setState({ filterDate: e.target.value })}
                onPressEnter={this.handleFilter}
                placeholder="Jane Doe"
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
          />
        </div>
      </div>
    );
  }
}
export default Experiments;
