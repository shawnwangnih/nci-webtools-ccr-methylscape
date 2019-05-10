import React from 'react'
import {
    Table, Input, Button, Icon, Tag
  } from 'antd';
import Highlighter from 'react-highlight-words';


class resultsTable extends React.Component {
    constructor(){
      super()
      this.state = {
        loading: true,
        searchText: '',
        pagination: { position: "bottom", size: 5 },
        data: []
      };
    }

    createDataTable = (indexData) => {
      var data = []
      // experiment will be a unqie key, Key is nessecary
      var tempKey = 1
      for(var file in indexData){
        var cur = {}
        console.log(indexData[file]["metaData"])
        cur = indexData[file]["metaData"]
        cur["key"] = indexData[file]["metaData"]["experiment"] + tempKey
        tempKey ++
        data = [...data, cur]
      }
      console.log(data)
      this.setState({data})
    }

    componentDidMount(){
      fetch('http://localhost:5000/api/methylScapeIndexFile')
      .then(res => res.json())
      .then(data => {
        // console.log(data)
        // this.setState({data})
        this.createDataTable(data)
        this.setState({loading: false})
      })
    }
   
    
    getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              ref={node => { this.searchInput = node; }}
              placeholder={`Search ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="primary"
              onClick={() => this.handleSearch(selectedKeys, confirm)}
              icon="search"
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              Search
            </Button>
            <Button
              onClick={() => this.handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </div>
        ),
        filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
          if (visible) {
            setTimeout(() => this.searchInput.select());
          }
        },
        render: (text) => (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[this.state.searchText]}
            autoEscape
            textToHighlight={text.toString()}
          />
        ),
    })

    handleSearch = (selectedKeys, confirm) => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
      }
    
    handleReset = (clearFilters) => {
        clearFilters();
        this.setState({ searchText: '' });
    }
    
    render(){
        const columns = [
            {
                title: 'Project',
                dataIndex: 'project',
                sorter: true,
                width: '20%',
                ...this.getColumnSearchProps('project'),
                render: (text, record )=> <a href='google.com'>{record.project}</a>
            },{
                title: 'Investigator Name',
                dataIndex: 'investigator',
                sorter: true,
                width: '20%',
                ...this.getColumnSearchProps('investigator'),
            },{
                title: '# of samples',
                dataIndex: 'sampleSize',
                sorter: true,
                width: '20%',
                ...this.getColumnSearchProps('sampleSize'),
            },{
                title: 'Date',
                dataIndex: 'date',
                sorter: true,
                width: '15%',
            },{
              title: 'Summary Stats',
              // dataIndex: 'data.metaData.investigator',
              sorter: true,
              width: '20%',
              render: record => <a href='google.com'>{record.key}</a>
          }];

        return(
            <div>
                <div>
                    <h4>Filter</h4>
                    <Tag closable >Filter 1 test</Tag>
                    <Tag closable >Filter 2 test</Tag>
                </div>
                <br></br>
                <Table
                    {...this.state}
                    columns={columns}
                    dataSource={this.state.data}
                    onChange={this.handleTableChange}
                />
            </div>
        )
    }
}
export default resultsTable
