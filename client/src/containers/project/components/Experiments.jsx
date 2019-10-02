import React from 'react';
import { Table, Input, Button, Form, Select } from 'antd';

class Experiments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterExperiment: '',
      filterDate: '',
      loading: true,
      pagination: {
        position: 'bottom',
        size: 'small',
        // pageSize: 15,
        showSizeChanger: true,
        itemRender: this.itemRender
      },
      data: [],
      filteredData: []
    };
  }

  componentDidMount() {
    fetch('http://localhost:5000/api/project/experiments', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectID: this.state.projectID
      })
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ experiments: data });
        this.setState({ filteredData: data });
        this.setState({ loading: false });
      });
  }

  handleFilter = () => {
    this.setState({
      filteredData: this.state.data.filter(row => {
        return row.project
          .toLowerCase()
          .includes(this.state.filterExperiment.toLowerCase());
      })
    });
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
        title: 'Experiment',
        dataIndex: 'experiment',
        sorter: true,
        width: '20%'
      },
      {
        title: 'Date created',
        dataIndex: 'date',
        sorter: true,
        width: '10%'
      },
      {
        title: 'Investigator Name',
        dataIndex: 'investigator',
        sorter: true,
        width: '10%'
      },
      {
        title: '# of samples',
        dataIndex: 'sampleSize',
        sorter: true,
        width: '10%'
      },
      {
        title: 'Experimental Worksheet',
        sorter: true,
        width: '20%',
        render: record => <a href="...">{record.key}</a>
      },
      {
        title: 'Experiment Details',
        sorter: true,
        width: '20%',
        render: record => <a href="...">{record.key}</a>
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
