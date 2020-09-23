import React from 'react';
import { Link } from 'react-router-dom';
import { DatePicker, Table, Input, Button, Form, Select, Modal } from 'antd';
import fileSaver from 'file-saver';
import './Experiments.css';
import moment from 'moment';
const { RangePicker } = DatePicker;

class Experiments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterProject: props.filter.project,
      filterExperiment: props.filter.experiment,
      filterNumSamples: '',
      filterInvestigator: '',
      startDate: '',
      endDate: '',
      loading: true,
      pagination: {
        position: 'bottom',
        size: 'small',
        // pageSize: 15,
        defaultPageSize: 25,
        pageSizeOptions: ['10', '25', '50', '100'],
        showSizeChanger: true,
        itemRender: this.itemRender,
        showTotal: this.rangeFunction,
      },
      rawData: props.data,
      data: [],
      filteredData: [],
      filePopUp: false,
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
  checkDates(date, s) {
    if (s == '') {
      return true;
    }
    let start = s.split('-');
    //let end = e.split('-');
    let check = date.split('/');
    let startDate = new Date(
      parseInt(start[2]),
      parseInt(start[0]) - 1,
      parseInt(start[1])
    );
    /*let endDate = new Date(
      parseInt(end[2]),
      parseInt(end[0]),
      parseInt(end[1])
    );*/
    let toCheck = new Date(
      parseInt(check[2]),
      parseInt(check[0]) - 1,
      parseInt(check[1])
    );
    return (
      parseInt(start[2]) == parseInt(check[2]) &&
      parseInt(start[1]) == parseInt(check[1]) &&
      parseInt(start[0]) == parseInt(check[0])
    );
  }

  getMonth(element) {
    let months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    for (let i = 0; i < months.length; i++) {
      if (months[i] == element) {
        return i;
      }
    }
    return 0;
  }

  compareDates(a, b) {
    let datea = a.date;
    let dateb = b.date;
    let converted1 = new Date();
    let converted2 = new Date();
    if (datea.includes('-')) {
      let date1 = datea.split('-');
      converted1 = new Date(2019, this.getMonth(date1[1]), parseInt(date1[0]));
    } else {
      let date1 = datea.split('/');
      converted2 = new Date(
        parseInt(date1[2]),
        parseInt(date1[0]),
        parseInt(date1[1])
      );
    }
    if (dateb.includes('-')) {
      let date2 = dateb.split('-');
      converted2 = new Date(2019, this.getMonth(date2[1]), parseInt(date2[0]));
    } else {
      let date2 = dateb.split('/');
      converted2 = new Date(
        parseInt(date2[2]),
        parseInt(date2[0]),
        parseInt(date2[1])
      );
    }
    return converted1 > converted2;
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
    this.setState(
      {
        filterNumSamples: '',
        filterInvestigator: '',
        startDate: '',
        endDate: '',
      },
      () => {
        this.handleFilter();
      }
    );
  }

  async componentDidMount() {
    await this.createDataTable(this.state.rawData).then(() => {
      this.setState({ loading: false });
      this.handleFilter();
    });
    var elements = document.getElementsByClassName('ant-calendar-picker-input');
    for (var i = 0; i < elements.length; i++) {
      elements[i].setAttribute('aria-label', 'Date Filter');
    }
  }

  async componentDidUpdate() {
    var elements = document.getElementsByClassName('ant-calendar-picker-input');
    for (var i = 0; i < elements.length; i++) {
      elements[i].setAttribute('aria-label', 'Date Filter');
    }
  }

  showFile(blob) {
    return;
  }

  async downloadFile(experiment, file, retry = 3) {
    try {
      const response = await fetch(`/getMethylScapeQCFile`, {
        method: 'POST',
        body: JSON.stringify({
          experiment: experiment,
          fileName: file,
        }),
      });

      if (!response.ok) {
        this.setState({ filePopUp: true });
      } else {
        // check for siteminder redirect
        // if x-powered-by: express exists then return blob url
        // else repeat function
        if (response.headers.get('x-powered-by')) {
          const url = URL.createObjectURL(await response.blob());
          window.open(url, '_blank');
          URL.revokeObjectURL(url);
        } else {
          if (retry > 0) this.downloadFile(experiment, file, retry - 1);
          else this.setState({ filePopUp: true });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  createDataTable = async (rawData) => {
    var experimentData = {};
    rawData.map((sample) => {
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
          experiment: curExperiment,
        };
      }
    });
    this.setState({ data: Object.values(experimentData) });
    this.setState({ filteredData: Object.values(experimentData) });
  };

  handleFilter = () => {
    this.setState({
      filteredData: this.state.data.filter((row) => {
        return (
          row.project.toLowerCase().includes(this.getFilterProject()) &&
          row.experiment.toLowerCase().includes(this.getFilterExperiment()) &&
          row.investigator
            .toLowerCase()
            .includes(this.getFilterInvestigator()) &&
          (this.getFilterNumSamples() == '' ||
            row.sampleSize == parseInt(this.getFilterNumSamples())) &&
          (this.state.startDate == '' ||
            this.checkDates(row.date, this.state.startDate))
        );
      }),
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
        filterProject: '',
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

  closePopup() {
    this.setState({
      filePopUp: false,
    });
  }
  renderPopUp() {
    if (this.state.filePopUp == true) {
      return (
        //<p>HELLO lqkwejbgvoiasudvnboiasulbjnalwegijabvidjbahpiduvjbawelkjbvasidlubjaldkvjwaebsvilubjva</p>
        /*
        footer={[
            <Button key="submit" type="primary" onClick={this.closePopup()}>
              close
            </Button>
          ]}*/

        <Modal
          title="File Does Not Exist"
          visible={this.state.filePopUp}
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                this.setState({ filePopUp: false });
              }}
            >
              Ok
            </Button>,
          ]}
        >
          <p>The file you are looking for does not exist</p>
        </Modal>
      );
    }
    return <div />;
  }

  render() {
    //console.log(JSON.stringify(this.state.filteredData));
    const columns = [
      {
        title: 'Project',
        dataIndex: 'project',
        sorter: true,
        width: '20%',
        //sorter: (a, b) => a.project.localeCompare(b.project),
        defaultSortOrder: 'ascend',
        render: (text, record) => (
          <a
            onClick={() =>
              this.props.changeTab('projects', { project: record.project })
            }
          >
            {record.project}
          </a>
        ),
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
            }
          >
            {text}
          </a>
        ),
      },
      {
        title: 'Investigator Name',
        dataIndex: 'investigator',
        sorter: true,
        width: '15%',
        sorter: (a, b) => a.investigator.localeCompare(b.investigator),
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
            }
          >
            {text}
          </a>
        ),
      },
      {
        title: 'Experiment Date',
        dataIndex: 'date',
        sorter: (a, b) => this.compareDates(a, b),
        width: '13%',
      },
      {
        title: 'QC Sheet',
        width: '9%',
        render: (record) => (
          <a
            onClick={() =>
              this.downloadFile(
                record.experiment,
                record.experiment + '.qcReport.pdf'
              )
            }
          >
            view pdf
          </a>
        ),
      },
      {
        title: 'QC Supplementary',
        width: '15%',
        render: (record) => (
          <a
            onClick={() =>
              this.downloadFile(
                record.experiment,
                record.experiment + '.supplementary_plots.pdf'
              )
            }
          >
            view pdf
          </a>
        ),
      },
    ];

    const Option = Select.Option;
    const InputGroup = Input.Group;

    return (
      <div className="page-overflow-box">
        <div
          style={{
            minWidth: '1200px',
            paddingLeft: '30px',
            paddingRight: '30px',
          }}
        >
          {this.renderPopUp()}
          <div
            style={{
              paddingLeft: '0',
              paddingBottom: '0px',
              paddingTop: '15px',
            }}
          >
            <Form layout="inline">
              <Form.Item
                style={{
                  width: '20%',
                  paddingLeft: '0px',
                  paddingRight: '0px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Project Filter Input"
                  value={this.state.filterProject}
                  onChange={(e) =>
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
                  paddingLeft: '8px',
                  paddingRight: '16px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Experiment Filter Input"
                  value={this.state.filterExperiment}
                  onChange={(e) =>
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
                  paddingLeft: '8px',
                  paddingRight: '16px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Investivator Filter Input"
                  value={this.state.filterInvestigator}
                  onChange={(e) =>
                    this.setState(
                      { filterInvestigator: e.target.value },
                      () => {
                        this.handleFilter();
                      }
                    )
                  }
                  onPressEnter={this.handleFilter}
                />
              </Form.Item>
              <Form.Item
                style={{
                  width: '13%',
                  paddingLeft: '8px',
                  paddingRight: '16px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Number of Samples Filter Input"
                  value={this.state.filterNumSamples}
                  onChange={(e) =>
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
                  paddingLeft: '8px',
                  paddingRight: '16px',
                  marginRight: '0px',
                }}
              >
                <DatePicker
                  onChange={(date, dateString) => {
                    this.setState({ startDate: dateString }, () => {
                      this.handleFilter();
                    });
                  }}
                  format="MM-DD-YYYY"
                  value={
                    this.state.startDate == ''
                      ? ''
                      : moment(this.state.startDate, 'MM-DD-YYYY')
                  }
                  placeholder=""
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
              {/*<Form.Item>
              <Button icon="search" type="primary" onClick={this.handleFilter}>
                Search
              </Button>
              {/* <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                Clear
              </Button> */}
              {/*</Form.Item>*/}
            </Form>
          </div>
          {/*rowClassName={(record, index) => {
              return index % 2 == 0 ? 'whiteBack' : 'grayBack';
            }}*/}
          <div>
            <Table
              {...this.state}
              size="small"
              columns={columns}
              dataSource={this.state.filteredData}
              onChange={this.handleTableChange}
              rowClassName={(record, index) => {
                return index % 2 == 0 ? 'whiteBack' : 'grayBack';
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Experiments;
