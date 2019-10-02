import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, Button, Form, Select } from 'antd';
import fileSaver from 'file-saver';
import './Experiments.css';
class Experiments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterProject: props.filter.project,
      filterExperiment: props.filter.experiment,
      loading: true,
      pagination: {
        position: 'bottom',
        size: 'small',
        // pageSize: 15,
        showSizeChanger: true,
        itemRender: this.itemRender,
        showTotal: this.rangeFunction,
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
    this.setState({
      filteredData: this.state.data.filter(row => {
        return (
          row.project.toLowerCase().includes(this.getFilterProject()) &&
          row.experiment.toLowerCase().includes(this.getFilterExperiment())
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

  itemRender(current,type,originalElement){
    if (type === 'prev') {
      return <a>&#60;</a>;
    }
    if (type === 'next') {
      return <a>&#62;</a>;
    }
    return <a>{current}</a>
  }


  render() {
    const columns = [
      {
        title: 'Project',
        dataIndex: 'project',
        sorter: true,
        width: '20%',
        sorter: (a, b) => a.project.localeCompare(b.project),
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
            'padding-left': '16px',
            'padding-bottom': '5px',
            'padding-top': '2px'
          }}>
          <Form layout="inline">
            <Form.Item>
              <Input
                value={this.state.filterProject}
                onChange={e => this.setState({ filterProject: e.target.value })}
                placeholder="Project Name"
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item>
              <Input
                value={this.state.filterExperiment}
                onChange={e =>
                  this.setState({ filterExperiment: e.target.value })
                }
                placeholder="Experiment Name"
                onPressEnter={this.handleFilter}
              />
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
