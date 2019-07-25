import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, Button, Form, Select, PageHeader } from 'antd';

class Projects extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterProject: this.props.filter.project,
      filterInvestigator: '',
      loading: true,
      pagination: {
        position: 'bottom',
        size: 5,
        showSizeChanger: true
      },
      sortedInfo: null,
      data: [],
      filteredData: [],
      rawData: props.data
    };
  }

  // async componentDidMount() {
  //   console.log("Project compnoenet Did mount")
  //   await this.createDataTable(this.state.data).then(
  //     this.setState({loading: false})
  //   )
  // }

  async componentWillReceiveProps(nextProps) {
    console.log('Project Recieve prop', nextProps);
    this.createDataTable(nextProps.data);
    if (nextProps.filter.project) {
      this.setState({ filterProject: nextProps.filter.project }, () => {
        this.handleFilter();
      });
    } else {
      this.handleFilter();
    }
  }

  createDataTable = async rawData => {
    var projectData = {};
    rawData.map(sample => {
      var curProject = sample.project;
      if (curProject == null) {
      } else if (curProject in projectData) {
        projectData[curProject].sampleSize =
          projectData[curProject].sampleSize + 1;
        projectData[curProject].experiments.add(sample.experiment);
      } else {
        projectData[curProject] = {
          key: curProject,
          project: curProject,
          sampleSize: 1,
          date: sample.date,
          investigator: sample.investigator,
          experiments: new Set([])
        };
        projectData[curProject].experiments.add(sample.experiment);
      }
    });
    this.setState({ data: Object.values(projectData) });
    this.setState({ filteredData: Object.values(projectData) });
  };

  handleFilter = () => {
    console.log('Handle filter in project', this.state.data);
    this.setState(
      {
        filteredData: this.state.data.filter(row => {
          return (
            row.project.toLowerCase().includes(this.getFilterProject()) &&
            row.investigator
              .toLowerCase()
              .includes(this.state.filterInvestigator.toLowerCase())
          );
        })
      },
      this.setState({ loading: false })
    );
  };

  handleReset = () => {
    this.setState(
      {
        filterProject: '',
        filterInvestigator: ''
      },
      () => {
        this.handleFilter();
      }
    );
  };

  getFilterProject = () => {
    return this.state.filterProject
      ? this.state.filterProject.toLowerCase()
      : '';
  };

  setProjSort = () => {
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'key'
      }
    });
  };

  render() {
    const columns = [
      {
        title: 'Project',
        dataIndex: 'key',
        sorter: true,
        width: '20%',
        sorter: (a, b) => a.key.localeCompare(b.key),
        render: (text, record) => (
          <a onClick={() => this.props.changeSummeryPorject(record.project)}>
            {text}
          </a>
        )
      },
      {
        title: 'Investigator Name',
        dataIndex: 'investigator',
        sorter: true,
        width: '20%',
        sorter: (a, b) => a.investigator.localeCompare(b.investigator)
      },
      {
        title: '# of Experiments',
        dataIndex: 'experiments',
        sorter: true,
        width: '20%',
        sorter: (a, b) => a.experiments.size - b.experiments.size,
        render: (text, record) => (
          <a
            onClick={() =>
              this.props.changeTab('experiments', { project: record.project })
            }>
            {record.experiments.size}
          </a>
        )
      },
      {
        title: '# of Samples',
        dataIndex: 'sampleSize',
        sorter: true,
        width: '20%',
        sorter: (a, b) => a.sampleSize - b.sampleSize,
        render: (text, record) => (
          <a
            onClick={() =>
              this.props.changeTab('samples', { project: record.project })
            }>
            {text}
          </a>
        )
      },
      {
        title: 'Project Date',
        dataIndex: 'date',
        sorter: true,
        width: '15%'
      }
    ];

    return (
      <div>
        <div>
          {/* <PageHeader title={"MethylScape Results"} /> */}
          <br />
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
                onChange={e =>
                  this.setState({ filterInvestigator: e.target.value })
                }
                onPressEnter={this.handleFilter}
                placeholder="Jane Doe"
              />
            </Form.Item>
            <Form.Item>
              <Button icon="search" type="primary" onClick={this.handleFilter}>
                Search
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                Clear
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
        <br />
      </div>
    );
  }
}
export default Projects;
