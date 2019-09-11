import React from 'react';
// import { Link } from 'react-router-dom';
import { Table, Input, Button, Form } from 'antd';
import { DatePicker } from 'antd';
import './Projects.css';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

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
      rawData: props.data,
      currRecord: '',
      endDate: '',
      startDate: '',
      numSamples: '',
      numExperiments: ''
    };
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.data.length == 0) {
      return;
    }
    await this.createDataTable(nextProps.data);
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

  rangeFunction(total, range) {
    return (
      range[0].toString() +
      '-' +
      range[1].toString() +
      'of ' +
      total.toString() +
      ' items'
    );
  }

  checkDates(date, s, e) {
    if (s == '' || e == '') {
      return true;
    }
    let start = s.split('-');
    let end = e.split('-');
    let check = date.split('/');

    let startDate = new Date(
      parseInt(start[0]),
      parseInt(start[1]),
      parseInt(start[2])
    );
    let endDate = new Date(
      parseInt(end[0]),
      parseInt(end[1]),
      parseInt(end[2])
    );
    let toCheck = new Date(
      parseInt(check[2]),
      parseInt(check[0]),
      parseInt(check[1])
    );
    console.log(startDate);
    console.log(endDate);
    console.log(toCheck);

    return startDate <= toCheck && endDate >= toCheck;
  }
  handleFilter = () => {
    this.setState(
      {
        filteredData: this.state.data.filter(row => {
          console.log(row.sampleSize);
          return (
            row.project.toLowerCase().includes(this.getFilterProject()) &&
            row.investigator
              .toLowerCase()
              .includes(this.state.filterInvestigator.toLowerCase()) &&
            (row.experiments.size.toString() ==
              this.state.numExperiments.trim() ||
              this.state.numExperiments.trim() == '') &&
            (row.sampleSize == this.state.numSamples.trim() ||
              this.state.numSamples.trim() == '') &&
            this.checkDates(row.date, this.state.startDate, this.state.endDate)
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

  handleProjectClick = (text, record) => {
    this.setState({
      currRecord: record.project
    });
    this.props.changeSummeryPorject(record.project);
  };

  handleDateChange = (date, dateString) => {
    console.log(dateString);
    this.setState({ startDate: dateString[0], endDate: dateString[1] });
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
          <a onClick={() => this.handleProjectClick(text, record)}>{text}</a>
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
            {/*<Form.Item label="# of experiments">
              <Input
                value={this.state.numExperiments}
                onChange={e =>
                  this.setState({ numExperiments: e.target.value })
                }
                onPressEnter={this.handleFilter}
                placeholder="0"
              />
            </Form.Item>
            <Form.Item label="# of samples">
              <Input
                value={this.state.numSamples}
                onChange={e => this.setState({ numSamples: e.target.value })}
                onPressEnter={this.handleFilter}
                placeholder="0"
              />
            </Form.Item>
            <Form.Item label="Date">
              <RangePicker
                onChange={this.handleDateChange}
                onPressEnter={this.handleFilter}
              />
              </Form.Item>*/}
            <Form.Item>
              <Button icon="search" type="primary" onClick={this.handleFilter}>
                Search
              </Button>
              {/* <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                Clear
              </Button> */}
            </Form.Item>
          </Form>
        </div>
        <br />
        <Table
          rowClassName={(record, index) => {
            return this.state.currRecord == ''
              ? index == 0
                ? 'testing'
                : ''
              : record.project == this.state.currRecord
              ? 'testing'
              : '';
          }}
          {...this.state}
          pagination={{
            position: 'top',
            size: this.state.pagination.size,
            showSizeChanger: this.state.pagination.showSizeChanger,
            showTotal: this.rangeFunction
          }}
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
