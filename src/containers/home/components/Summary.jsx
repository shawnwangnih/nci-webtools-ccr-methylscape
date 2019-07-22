import React from 'react'
// import { Container, Row, Col } from 'react-bootstrap';
import { Row, Col } from 'antd';
import { ColumnChart, PieChart } from 'react-chartkick'
import 'chart.js'


class Summary extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      project: "",
      filteredData: [],
    }
  }



  componentWillReceiveProps(nextProps){
    if(nextProps.project == ""){
      this.setState({project:nextProps.data[1].project})
      this.filterData(nextProps.data[1].project, nextProps.data)
    }else{
      this.setState({project:nextProps.project})
      this.filterData(nextProps.project, nextProps.data)
    }
  }

  filterData = (filter, data) => {
    this.setState({
      filteredData: data.filter( (row,i) => {
        row.key = i;
        return row.project.toLowerCase()
          .includes(filter.toLowerCase());
      })
    });
  }

   getMethylationClasses = () => {
    let cur = {}
    let pieData = []
    this.state.filteredData.map(row => {
      Object.values(row.classifier_prediction).forEach(cp => {
        Object.keys(cp).forEach(key => {
          cur[key] = (cur[key] + 1) || 1 ;
        })
      })
    })
    Object.keys(cur).forEach(k => {
        // pieData.push({label:k, value:cur[k]})
        pieData.push([k.replace("methylation class ", ""), cur[k]])

    })
    return pieData
  }

  getGender = () => {
    let cur = {}
    let pieData = []
    this.state.filteredData.map(row => {
      cur[row.gender] = (cur[row.gender] + 1) || 1 ;
    })
    Object.keys(cur).forEach(k => {
      pieData.push([k, cur[k]])

    })
    return pieData
  }

  getAgeDistribution = () => {
    let cur = {}
    let pieData = []
    this.state.filteredData.map(row => {
      cur[row.age] = (cur[row.age] + 1) || 1 ;
    })
    Object.keys(cur).forEach(k => {
      pieData.push([k, cur[k]])

    })
    return pieData
  }

  render(){
      return(
          <div>
            <h3>Project summery: {this.state.project}</h3>
            <br></br>
            <Row type="flex" justify="center" align="middle" >
              <Col span={8} order={1} >
                <h4 className='summery-data-title'>Methylation Classes</h4>
                <br></br>
                <PieChart data={this.getMethylationClasses()}  legend="bottom"/>
              </Col>
              <Col span={8} order={2}>
                <h4 className='summery-data-title'>Gender</h4>
                <br></br>
                <PieChart data={this.getGender()}  legend="bottom"/>
              </Col>
              <Col span={8} order={3}>
                <h4 className='summery-data-title'>Age Distribution</h4>
                <br></br>
                <ColumnChart data={this.getAgeDistribution()} />
              </Col>
              </Row>
          </div>
      )
  }
}

export default Summary;
