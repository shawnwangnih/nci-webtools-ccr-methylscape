import React from 'react';
import Highlighter from 'react-highlight-words';
import { Table, Input, Button, Form, Select, Icon } from 'antd';
import fileSaver from 'file-saver';

class Samples extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterSample: '',
      filterProject: props.filter.project,
      filterSentrixID: props.filter.experiment,
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

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}>
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    )
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  async componentWillReceiveProps(nextProps) {
    if (nextProps.filter.project !== undefined) {
      this.setState({ filterProject: nextProps.filter.project }, () => {
        this.handleFilter();
      });
    }
    if (nextProps.filter.experiment !== undefined) {
      this.setState({ filterSentrixID: nextProps.filter.experiment }, () => {
        this.handleFilter();
      });
    }
  }

  async componentDidMount() {
    await this.createDataTable(this.state.rawData).then(
      this.setState({ loading: false })
    );
    this.handleFilter();
  }

  createDataTable = async rawData => {
    var sampleData = {};
    sampleData = rawData.map(sample => {
      sample.key = sample.id;
      var cp = sample.classifier_prediction;
      sample.family = this.getMF(cp);
      sample.family_score = this.getMFScore(cp);
      sample.class = this.getMC(cp);
      sample.class_score = this.getMCScore(cp);
      return sample;
    });
    this.setState({ data: sampleData });
    this.setState({ filteredData: sampleData });
  };

  handleFilter = () => {
    this.setState({
      filteredData: this.state.data.filter(row => {
        return (
          row.project.toLowerCase().includes(this.getFilterProject()) &&
          row.experiment.toLowerCase().includes(this.getExperimentFilter())
        );
      })
    });
  };

  getExperimentFilter = () => {
    return this.state.filterSentrixID
      ? this.state.filterSentrixID.toLowerCase()
      : '';
  };

  getFilterProject = () => {
    return this.state.filterProject
      ? this.state.filterProject.toLowerCase()
      : '';
  };

  getMF = data => {
    return Object.keys(data).length > 2 ? Object.keys(data['0']) : '';
  };

  getMFScore = data => {
    return Object.values(data).length > 2 ? Object.values(data['0']) : '';
  };

  getMC = data => {
    const size = Object.keys(data).length;
    if (size > 2) {
      return Object.keys(data['2'])[0];
    } else if (size === 2) {
      return Object.keys(data['1'])[0];
    } else {
      return '';
    }
  };

  getMCScore = data => {
    const size = Object.keys(data).length;
    if (size > 2) {
      return Object.values(data['2'])[0];
    } else if (size === 2) {
      return Object.values(data['1'])[0];
    } else {
      return '';
    }
  };

  handleReset = () => {
    this.setState(
      {
        filterProject: '',
        filterSentrixID: ''
      },
      () => {
        this.handleFilter();
      }
    );
  };

  async downloadFile(sampleId, file) {
    const root =
      process.env.NODE_ENV === 'development'
        ? 'http://0.0.0.0:8290/'
        : window.location.pathname;

    try {
      let response = await fetch(`${root}/getMethylScapeFile`, {
        method: 'POST',
        body: JSON.stringify({
          sampleId: sampleId,
          fileName: file
        })
      });
      let url = URL.createObjectURL(await response.blob());
      window.open(url, '_blank');
      URL.revokeObjectUrl(url);
    } catch (e) {
      console.log(e);
    }
    /*    }

      .then(res => {
        return res.blob();
      })
      .then(function(blob) { // (**)
        // fileSaver(blob, file);
        return URL.createObjectURL(blob);
      })
      .then(url => {
      })
      .catch(error => console.log(error));
      */
  }

  render() {
    const columns = [
      {
        title: 'Sample Name',
        dataIndex: 'sample_name',
        sorter: true,
        width: '320',
        fixed: 'left',
        sorter: (a, b) => a.sample_name.localeCompare(b.sample_name),
        ...this.getColumnSearchProps('sample_name')
      },
      {
        title: 'Project',
        dataIndex: 'project',
        sorter: true,
        width: '300',
        sorter: (a, b) => a.project.localeCompare(b.project),
        ...this.getColumnSearchProps('project')
      },
      {
        title: 'Experiment',
        dataIndex: 'experiment',
        sorter: true,
        width: '350',
        sorter: (a, b) => a.experiment.localeCompare(b.experiment),
        ...this.getColumnSearchProps('experiment'),
        render: (text, record) => (
          <a
            // onClick={() =>
            //   this.props.changeTab('experiments', { project: record.project })
            onClick={() =>
              this.setState({ filterSentrixID: record.experiment }, () =>
                this.handleFilter()
              )
            }>
            {text}
          </a>
        )
      },
      {
        title: 'Date',
        dataIndex: 'date',
        // sorter: true,
        ...this.getColumnSearchProps('date'),
        width: '200'
      },
      {
        title: 'Surgical Case',
        dataIndex: 'surgical_case',
        sorter: true,
        sorter: (a, b) => a.surgical_case.localeCompare(b.surgical_case),
        ...this.getColumnSearchProps('surgical_case'),
        width: '200'
      },
      {
        title: 'Gender',
        dataIndex: 'gender',
        sorter: true,
        sorter: (a, b) => a.gender.localeCompare(b.gender),
        ...this.getColumnSearchProps('gender'),
        width: '200'
      },
      {
        title: 'Age',
        dataIndex: 'age',
        sorter: true,
        sorter: (a, b) => parseInt(a.age) > parseInt(b.age),
        ...this.getColumnSearchProps('age'),
        width: '200'
      },
      {
        title: 'Diagnosis',
        dataIndex: 'diagnosis',
        sorter: true,
        sorter: (a, b) => a.diagnosis.localeCompare(b.diagnosis),
        ...this.getColumnSearchProps('diagnosis'),
        width: '200'
      },
      {
        title: 'Methylation Family (MF)',
        dataIndex: 'family',
        sorter: true,
        sorter: (a, b) => a.family.localeCompare(b.family),
        ...this.getColumnSearchProps('family'),
        width: '200'
      },
      {
        title: 'MF Calibrated Scores',
        dataIndex: 'family_score',
        sorter: true,
        sorter: (a, b) => a.family_score.localeCompare(b.family_score),
        ...this.getColumnSearchProps('family_score'),
        width: '200'
      },
      {
        title: 'Methylation Class (MC)',
        dataIndex: 'class',
        sorter: true,
        sorter: (a, b) => a.class.localeCompare(b.class),
        ...this.getColumnSearchProps('class'),
        width: '200'
      },
      {
        title: 'MC Calibrated Scores',
        dataIndex: 'class_score',
        sorter: true,
        sorter: (a, b) => a.class_score.localeCompare(b.class_score),
        ...this.getColumnSearchProps('class_score'),
        width: '200'
      },
      {
        title: 'MGMT status',
        dataIndex: 'mgmt_prediction.Status',
        sorter: true,
        sorter: (a, b) =>
          a.mgmt_prediction.Status.localeCompare(b.mgmt_prediction.Status),
        ...this.getColumnSearchProps('mgmt_prediction.Status'),
        width: '200'
      },
      {
        title: 'MGMT score',
        dataIndex: 'mgmt_prediction.Estimated',
        sorter: true,
        sorter: (a, b) =>
          a.mgmt_prediction.Estimated.localeCompare(
            b.mgmt_prediction.Estimated
          ),
        ...this.getColumnSearchProps('mgmt_prediction.Estimated'),
        width: '200'
      },
      {
        title: 't-SNE plot',
        width: '200',
        render: record => (
          <a
            onClick={() =>
              this.downloadFile(record.id, record.sample_name + '.html')
            }>
            view plot
          </a>
        )
      },
      {
        title: 'NGS reports (pdf-files)',
        width: '200',
        render: record => (
          <a
            onClick={() =>
              this.downloadFile(record.id, record.sample_name + '_NGS.pdf')
            }>
            view pdf
          </a>
        )
      },
      {
        title: 'Slide Image',
        width: '200',
        render: record => (
          <a
            onClick={() =>
              this.downloadFile(record.id, record.sample_name + '.jpg')
            }>
            view image
          </a>
        )
      },
      {
        title: 'Notes',
        dataIndex: 'notes',
        sorter: true,
        ...this.getColumnSearchProps('notes'),
        sorter: (a, b) => a.notes.localeCompare(b.notes),
        width: '200'
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
            {/* <Form.Item label="Sample">
              <Input
                value={this.state.filterSample}
                onChange={e => this.setState({ filterSample: e.target.value })}
                placeholder="Sample"
                onPressEnter={this.handleFilter}
              />
            </Form.Item> */}
            <Form.Item label="Sentrix ID">
              <Input
                value={this.state.filterSentrixID}
                onChange={e =>
                  this.setState({ filterSentrixID: e.target.value })
                }
                onPressEnter={this.handleFilter}
                placeholder="ABD123"
              />
            </Form.Item>
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
            scroll={{ x: 3800 }}
          />
        </div>
      </div>
    );
  }
}
export default Samples;
