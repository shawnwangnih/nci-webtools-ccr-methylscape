import React from 'react';
// import { Link } from 'react-router-dom';
import { Table, Input, Button, Form, Radio } from 'antd';
import { DatePicker } from 'antd';
import './Projects.css';
import moment from 'moment';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

class Projects extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterProject: this.props.filter.project,
      loading: true,
      pagination: {
        position: 'bottom',
        size: 'small',
        showSizeChanger: true,
        style: {
          marginBottom: '0px',
        },
        defaultPageSize: 10,
        pageSizeOptions: ['10', '25', '50', '100'],
      },
      sortedInfo: null,
      data: [],
      filteredData: [],
      rawData: props.data,
      currRecord: '',
      filterInvestigator: '',
      endDate: '',
      startDate: '',
      filterNumSamples: '',
      filterNumExperiments: '',
      numSamples: '',
      numExperiments: '',
    };
  }

  //updates when the filters are updated and when the tabs are changed
  async componentWillReceiveProps(nextProps) {
    if (nextProps.data.length == 0) {
      this.setState({
        filterInvestigator: '',
        endDate: '',
        startDate: '',
        filterNumSamples: '',
        filterNumExperiments: '',
        filterProject: '',
      });
      return;
    }
    this.setState(
      {
        currRecord: nextProps.project !== undefined ? nextProps.project : '',
        filterInvestigator: '',
        endDate: '',
        startDate: '',
        filterNumSamples: '',
        filterNumExperiments: '',
        filterProject: '',
      },
      () => {
        this.handleFilter();
      }
    );

    await this.createDataTable(nextProps.data);
    if (nextProps.filter.project !== undefined) {
      this.setState({ filterProject: nextProps.filter.project }, () => {
        this.handleFilter();
      });
    } else {
      this.handleFilter();
    }
  }

  async componentDidMount() {
    this.fix508();
  }
  async componentDidUpdate() {
    this.fix508();
  }

  fix508() {
    const pageSizeInner = document.getElementsByClassName(
      'ant-select-selection__rendered'
    );
    const pageSizeOuter = document.querySelectorAll('.ant-select-selection');
    const pagination = document.querySelectorAll('.ant-pagination');
    const paginationItems = document.querySelectorAll(
      '.ant-pagination-total-text,  .ant-pagination-prev,.ant-pagination-item,.ant-pagination-next,.ant-pagination-options'
    );
    const hiddenTabs = document.querySelectorAll(
      'div.ant-tabs-tabpane.ant-tabs-tabpane-inactive'
    );
    const activeTab = document.querySelector(
      'div.ant-tabs-tabpane.ant-tabs-tabpane-active'
    );

    for (let element of pageSizeInner) {
      element.setAttribute('role', 'textbox');
      element.setAttribute('aria-label', 'current page size');
    }
    for (let element of pageSizeOuter) {
      element.setAttribute('aria-label', 'select page size');
    }
    for (let element of pagination) {
      element.setAttribute('role', 'list');
      element.setAttribute('aria-label', 'pagination');
    }
    for (let element of paginationItems) {
      element.setAttribute('role', 'listitem');
    }

    for (let tab of hiddenTabs) {
      tab.style.visibility = 'hidden';
    }

    activeTab.style.visibility = 'visible';
  }

  createDataTable = async (rawData) => {
    var projectData = {};
    if (rawData !== undefined) {
      rawData.map((sample) => {
        var curProject = sample.project;
        if (curProject == null || sample.experiment == null) {
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
            experiments: new Set([]),
          };
          projectData[curProject].experiments.add(sample.experiment);
        }
      });

      this.setState({ data: Object.values(projectData) });
      this.setState({ filteredData: Object.values(projectData) });

      if (this.state.currRecord == '') {
        let unsorted = Object.values(projectData);
        let sorted = [];
        for (let i = 0; i < unsorted.length; i++) {
          sorted.push(unsorted[i]['project']);
        }
        sorted.sort();
        this.setState({ currRecord: sorted[0] });
        this.props.changeSummeryPorject(sorted[0]);
      }
    }
  };

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

  handleFilter = () => {
    this.setState(
      {
        filteredData: this.state.data.filter((row) => {
          return (
            row.project.toLowerCase().includes(this.getFilterProject()) &&
            row.investigator
              .toLowerCase()
              .includes(this.state.filterInvestigator.toLowerCase()) &&
            (row.experiments.size.toString() ==
              this.state.filterNumExperiments.trim() ||
              this.state.filterNumExperiments.trim() == '') &&
            (row.sampleSize == this.state.filterNumSamples.trim() ||
              this.state.filterNumSamples.trim() == '') &&
            this.checkDates(row.date, this.state.startDate)
          );
        }),
      },
      this.setState({ loading: false })
    );
  };

  handleReset = () => {
    this.setState(
      {
        filterProject: '',
        filterInvestigator: '',
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
        columnKey: 'key',
      },
    });
  };

  handleProjectClick = (text, record) => {
    this.setState({
      currRecord: record.project,
    });
    this.props.changeSummeryPorject(record.project);
  };

  handleDateChange = (date, dateString) => {
    this.setState({ startDate: dateString[0], endDate: dateString[1] });
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

  handleRowClick(record, rowIndex) {
    //console.log('RECORD: ' + record);
    //console.log('INDEX: ' + rowIndex);
  }

  render() {
    //console.log(JSON.stringify(this.state.filteredData));
    const columns = [
      {
        title: <span style={{ display: 'none' }}>Select Project</span>,
        dataIndex: 'selected',
        sorter: false,
        width: '5%',
        render: (text, record) => {
          if (record.project == this.state.currRecord) {
            return (
              <Radio
                name={text}
                checked={true}
                onClick={() => {
                  this.handleProjectClick(text, record);
                }}
                aria-checked="true"
                aria-label={'Select Project ' + record.project}
              >
                <span style={{ display: 'none' }}>
                  {'Select Project ' + record.project}
                </span>
              </Radio>
              /*<div class="radio">
                <label>
                  <input type="radio" value="Check" />
                </label>
              </div>*/
            );
          }
          return (
            <Radio
              name={text}
              checked={false}
              onClick={() => {
                this.handleProjectClick(text, record);
              }}
              aria-checked="false"
              aria-label={'Select Project ' + record.project}
            >
              <span style={{ display: 'none' }}>Select Project</span>
            </Radio>
            /*<div class="radio">
              <label>
                <input type="radio" value="Uncheck" />
              </label>
            </div>*/
          );
        },
      },
      {
        title: (
          <div style={{ marginTop: '0px' }}>
            <p style={{ marginBottom: '0px' }}>Project</p>
            {/*<Form>
        <Form.Item
          style={{
            width: '100%',
            'marginRight': '0px',
            'marginBottom':'0px'
          }}>
          <Input
            value={this.state.filterProject}
            onChange={e =>
              this.setState({ filterProject: e.target.value }, () => {
                this.handleFilter();
              })
            }
            onPressEnter={this.handleFilter}
            onClick={() =>{}}
          />
        </Form.Item>
          </Form>*/}
          </div>
        ),
        dataIndex: 'key',
        sorter: true,
        width: '35%',
        sorter: (a, b) => a.key.localeCompare(b.key),
        defaultSortOrder: 'ascend',
        render: (text, record) => (
          <a onClick={() => this.handleProjectClick(text, record)}>{text}</a>
        ),
      },
      {
        title: 'Investigator Name',
        dataIndex: 'investigator',
        sorter: true,
        width: '20%',
        sorter: (a, b) => a.investigator.localeCompare(b.investigator),
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
            }
          >
            {record.experiments.size}
          </a>
        ),
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
            }
          >
            {text}
          </a>
        ),
      },
    ];
    return (
      <div className="page-overflow-box">
        <div
          style={{
            minWidth: '800px',
            paddingLeft: '30px',
            paddingRight: '30px',
          }}
        >
          <div
            style={{
              paddingLeft: '0px',
              paddingBottom: '0px',
              paddingTop: '15px',
            }}
          >
            {/* <PageHeader title={"MethylScape Results"} /> */}
            <Form layout="inline">
              <Form.Item
                style={{
                  width: '5%',
                  paddingLeft: '0px',
                  paddingRight: '0px',
                  marginRight: '0px',
                }}
              />
              <Form.Item
                style={{
                  width: '35%',
                  paddingLeft: '8px',
                  paddingRight: '16px',
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
                  width: '20%',
                  paddingLeft: '8px',
                  paddingRight: '16px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Investigator Filter Input"
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
                  width: '20%',
                  paddingLeft: '8px',
                  paddingRight: '16px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Number of Experiments Filter Input"
                  value={this.state.filterNumExperiments}
                  onChange={(e) =>
                    this.setState(
                      { filterNumExperiments: e.target.value },
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
                  width: '20%',
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
            </Form>
          </div>
          {/*rowClassName={(record, index) => {
            let selected =
              this.state.currRecord == ''
                ? index == 0
                  ? 'testing'
                  : ''
                : record.project == this.state.currRecord
                ? 'testing'
                : '';
            let coloring = index % 2 == 0 ? 'whiteBack' : 'grayBack';
            return selected == '' ? coloring : selected;
          }}*/}
          <Table
            {...this.state}
            size="small"
            pagination={{
              position: 'bottom',
              size: this.state.pagination.size,
              showSizeChanger: this.state.pagination.showSizeChanger,
              showTotal: this.rangeFunction,
              itemRender: this.itemRender,
              defaultPageSize: 10,
              pageSizeOptions: ['10', '25', '50', '100'],
              role: 'textbox',
            }}
            rowClassName={(record, index) => {
              return this.state.currRecord == ''
                ? index == 0
                  ? 'testing'
                  : ''
                : record.project == this.state.currRecord
                ? 'testing'
                : '';
            }}
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) => {
                  this.handleProjectClick(rowIndex, record);
                },
              };
            }}
            columns={columns}
            dataSource={this.state.filteredData}
            onChange={this.handleTableChange}
          />
        </div>
      </div>
    );
  }
}
export default Projects;
