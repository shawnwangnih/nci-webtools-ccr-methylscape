import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, Button, Form, Select } from 'antd';
import fileSaver from 'file-saver';

class Experiments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterProject: props.filter.project,
      loading: true,
      pagination: {
        position: 'bottom',
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
    if (nextProps.filter.project) {
      this.setState({ filterProject: nextProps.filter.project }, () => {
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

  downloadFile = (experiment, file) => {
    const root =
      process.env.NODE_ENV === 'development'
        ? 'http://0.0.0.0:8290/'
        : window.location.pathname;

    fetch(`${root}getMethylScapeQCFile`, {
      method: 'POST',
      body: JSON.stringify({
        experiment: experiment,
        fileName: file
      })
    })
      .then(res => {
        return res.blob();
      })
      .then(blob => {
        fileSaver(blob, file);
      })
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
        return row.project.toLowerCase().includes(this.getFilterProject());
      })
    });
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
        width: '20%',
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
        width: '10%',
        sorter: (a, b) => a.investigator.localeCompare(b.investigator)
      },
      {
        title: '# of samples',
        dataIndex: 'sampleSize',
        sorter: true,
        width: '10%',
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
        title: 'Date created',
        dataIndex: 'date',
        sorter: true,
        width: '10%'
      },
      {
        title: 'QC Sheet',
        width: '20%',
        render: record => (
          <a
            onClick={() =>
              this.downloadFile(
                record.experiment,
                record.experiment + '.qcReport.pdf'
              )
            }>
            link to pdf
          </a>
        )
      },
      {
        title: 'QC supplementary',
        width: '20%',
        render: record => (
          <a
            onClick={() =>
              this.downloadFile(
                record.experiment,
                record.experiment + '.supplementary_plots.pdf'
              )
            }>
            link to pdf
          </a>
        )
      }
    ];

    const Option = Select.Option;
    const InputGroup = Input.Group;

    return (
      <div>
        <br />
        <div
          style={{
            'padding-left': '16px',
            'padding-bottom': '0',
            'padding-top': '20px'
          }}>
          <Form layout="inline">
            <Form.Item label="Project">
              <Input
                value={this.state.filterProject}
                onChange={e => this.setState({ filterProject: e.target.value })}
                placeholder="MethylScape"
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item label="Experiments">
              <Input
                value={this.state.filterExperiment}
                onChange={e => this.setState({ filterProject: e.target.value })}
                placeholder="MethylScape"
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
