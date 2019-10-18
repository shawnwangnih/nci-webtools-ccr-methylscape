import React from 'react';
import { Link } from 'react-router-dom';
import { DatePicker, Table, Input, Button, Form, Select } from 'antd';
import fileSaver from 'file-saver';
import './Experiments.css';
const { RangePicker } = DatePicker;
class Experiments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterProject: props.filter.project,
      filterExperiment: props.filter.experiment,
      filterInvestigator: '',
      startDate: '',
      endDate: '',
      loading: true,
      pagination: {
        position: 'bottom',
        size: 'small',
        // pageSize: 15,
        showSizeChanger: true,
        itemRender: this.itemRender,
        showTotal: this.rangeFunction
      },
      rawData: props.data,
      data: [],
      filteredData: []
    };
  }

  rangeFunction(total, range) {
    return (
      'Showing ' +
      range[0].toString() +
      ' to ' +
      range[1].toString() +
      ' of ' +
      total.toString() +
      ' items'
    );
  }

  //Checks the dates from the form and and each date in the table
  //and sees if the date falls between the two days
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

    return startDate <= toCheck && endDate >= toCheck;
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.filter.project !== undefined) {
      this.setState({ filterProject: nextProps.filter.project }, () => {
        this.handleFilter();
      });
    }
    if (nextProps.filter.experiment !== undefined) {
      this.setState({ filterExperiment: nextProps.filter.experiment }, () => {
        this.handleFilter();
      });
    }
  }

  async componentDidMount() {
    await this.createDataTable(this.state.rawData).then(() => {
      this.setState({ loading: false });
      this.handleFilter();
    });
  }

  showFile(blob) {
    return;
  }

  downloadFile = (experiment, file) => {
    const root =
      process.env.NODE_ENV === 'development'
        ? 'http://0.0.0.0:8290/'
        : window.location.pathname;

    fetch(`${root}/getMethylScapeQCFile`, {
      method: 'POST',
      body: JSON.stringify({
        experiment: experiment,
        fileName: file
      })
    })
      .then(res => res.blob())
      .then(function(blob) {
        // (**)
        fileSaver(blob, file);
        return URL.createObjectURL(blob);
      })
      .then(url => {
        window.open(url, '_blank');
        URL.revokeObjectUrl(url);
      })
      .then()
      /*
      .then(blob => {
        fileSaver(blob, file);
      })*/
      .catch(error => console.log(error));
  };

  createDataTable = async rawData => {
    var experimentData = {};
    rawData.map(sample => {
      var curExperiment = sample.experiment;
      if (curExperiment == null) {
      } else if (curExperiment in experimentData) {
        experimentData[curExperiment].sampleSize =
          experimentData[curExperiment].sampleSize + 1;
      } else {
        experimentData[curExperiment] = {
          key: curExperiment,
          project: sample.project,
          sampleSize: 1,
          date: sample.date,
          investigator: sample.investigator,
          experiment: curExperiment
        };
      }
    });
    this.setState({ data: Object.values(experimentData) });
    this.setState({ filteredData: Object.values(experimentData) });
  };

  handleFilter = () => {
    console.log('INVESTIGATOR: ' + this.state.filterInvestigator);
    this.setState({
      filteredData: this.state.data.filter(row => {
        return (
          row.project.toLowerCase().includes(this.getFilterProject()) &&
          row.experiment.toLowerCase().includes(this.getFilterExperiment()) &&
          row.investigator
            .toLowerCase()
            .includes(this.getFilterInvestigator()) &&
          (this.getFilterNumSamples() == '' ||
            row.sampleSize == parseInt(this.getFilterNumSamples()))
        );
      })
    });
  };

  getFilterExperiment = () => {
    return this.state.filterExperiment
      ? this.state.filterExperiment.toLowerCase()
      : '';
  };
  getFilterProject = () => {
    return this.state.filterProject
      ? this.state.filterProject.toLowerCase()
      : '';
  };
  getFilterInvestigator = () => {
    return this.state.filterInvestigator
      ? this.state.filterInvestigator.toLowerCase()
      : '';
  };
  getFilterNumSamples = () => {
    return this.state.filterNumSamples
      ? this.state.filterNumSamples.toLowerCase()
      : '';
  };

  handleReset = () => {
    this.setState(
      {
        filterProject: ''
        // f: ''
      },
      () => {
        this.handleFilter();
      }
    );
  };

  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a>&#60;</a>;
    }
    if (type === 'next') {
      return <a>&#62;</a>;
    }
    return <a>{current}</a>;
  }

  render() {
    const columns = [
      {
        title: 'Project',
        dataIndex: 'project',
        sorter: true,
        width: '20%',
        sorter: (a, b) => a.project.localeCompare(b.project),
        defaultSortOrder: 'ascend',
        render: (text, record) => (
          <a
            onClick={() =>
              this.props.changeTab('projects', { project: record.project })
            }>
            {record.project}
          </a>
        )
      },
      {
        title: 'Experiment',
        dataIndex: 'experiment',
        sorter: true,
        width: '15%',
        sorter: (a, b) => a.experiment.localeCompare(b.experiment),
        render: (text, record) => (
          <a
            onClick={() =>
              this.props.changeTab('samples', { experiment: record.experiment })
            }>
            {text}
          </a>
        )
      },
      {
        title: 'Investigator Name',
        dataIndex: 'investigator',
        sorter: true,
        width: '15%',
        sorter: (a, b) => a.investigator.localeCompare(b.investigator)
      },
      {
        title: '# of Samples',
        dataIndex: 'sampleSize',
        sorter: true,
        width: '13%',
        sorter: (a, b) => a.sampleSize - b.sampleSize,
        render: (text, record) => (
          <a
            onClick={() =>
              this.props.changeTab('samples', { experiment: record.experiment })
            }>
            {text}
          </a>
        )
      },
      {
        title: 'Date Created',
        dataIndex: 'date',
        sorter: true,
        width: '13%'
      },
      {
        title: 'QC Sheet',
        width: '9%',
        render: record => (
          <a
            onClick={() =>
              this.downloadFile(
                record.experiment,
                record.experiment + '.qcReport.pdf'
              )
            }>
            view pdf
          </a>
        )
      },
      {
        title: 'QC Supplementary',
        width: '15%',
        render: record => (
          <a
            onClick={() =>
              this.downloadFile(
                record.experiment,
                record.experiment + '.supplementary_plots.pdf'
              )
            }>
            view pdf
          </a>
        )
      }
    ];

    const Option = Select.Option;
    const InputGroup = Input.Group;

    return (
      <div style={{ 'padding-left': '30px', 'padding-right': '30px' }}>
        <div
          style={{
            'padding-left': '0',
            'padding-bottom': '0px',
            'padding-top': '15px'
          }}>
          <Form layout="inline">
            <Form.Item
              style={{
                width: '20%',
                'padding-left': '16px',
                'padding-right': '16px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterProject}
                onChange={e =>
                  this.setState({ filterProject: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '15%',
                'padding-left': '16px',
                'padding-right': '16px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterExperiment}
                onChange={e =>
                  this.setState({ filterExperiment: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '15%',
                'padding-left': '16px',
                'padding-right': '16px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterInvestigator}
                onChange={e =>
                  this.setState({ filterInvestigator: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '13%',
                'padding-left': '16px',
                'padding-right': '16px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterNumSamples}
                onChange={e =>
                  this.setState({ filterNumSamples: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '13%',
                'padding-left': '16px',
                'padding-right': '16px',
                'margin-right': '0px'
              }}>
              <RangePicker>
                onChange
                {(date, dateString) => {
                  this.setState(
                    { startDate: dateString[0], endDate: dateString[1] },
                    () => console.log('####DATE####' + this.state.startDate)
                  );
                }}
              </RangePicker>
            </Form.Item>
            {/* <Form.Item label="Date">
              <Input
                value={this.state.filterDate}
                onChange={e => this.setState({ filterDate: e.target.value })}
                onPressEnter={this.handleFilter}
                placeholder="Jane Doe"
              />
            </Form.Item> */}
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
        <div>
          <Table
            {...this.state}
            columns={columns}
            dataSource={this.state.filteredData}
            onChange={this.handleTableChange}
            rowClassName={(record, index) => {
              return index % 2 == 0 ? 'whiteBack' : 'grayBack';
            }}
          />
        </div>
      </div>
    );
  }
}
export default Experiments;
