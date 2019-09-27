import React from 'react';
// import { Container, Row, Col } from 'react-bootstrap';
import { Row, Col } from 'antd';
import { ColumnChart, PieChart } from 'react-chartkick';
import 'chart.js';
import './Summary.css';
var Chart = require('chart.js');

class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      project: '',
      filteredData: []
    };
    this.graph1 = React.createRef();
    this.graph2 = React.createRef();
    this.backgroundColor = [
      '#3366CC',
      '#DC3912',
      '#FF9900',
      '#109618',
      '#990099',
      '#3B3EAC',
      '#0099C6',
      '#DD4477',
      '#66AA00',
      '#B82E2E',
      '#316395',
      '#994499',
      '#22AA99',
      '#AAAA11',
      '#6633CC',
      '#E67300',
      '#8B0707',
      '#329262',
      '#5574A6',
      '#651067'
    ];
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data.length === 0) {
      return;
    }
    if (nextProps.project === '') {
      this.setState({ project: nextProps.data[0].project });
      this.filterData(nextProps.data[0].project, nextProps.data);
    } else {
      this.setState({ project: nextProps.project });
      this.filterData(nextProps.project, nextProps.data);
    }
  }

  filterData = (filter, data) => {
    this.setState({
      filteredData: data.filter((row, i) => {
        row.key = i;
        return row.project.toLowerCase().includes(filter.toLowerCase());
      })
    });
  };

  getMethylationClasses = () => {
    let cur = {};
    let pieData = [];
    this.state.filteredData.map(row => {
      Object.values(row.classifier_prediction).forEach(cp => {
        Object.keys(cp).forEach(key => {
          cur[key] = cur[key] + 1 || 1;
        });
      });
    });
    Object.keys(cur).forEach(k => {
      // pieData.push({label:k, value:cur[k]})
      pieData.push([k.replace('methylation class ', ''), cur[k]]);
      //pieData[0].push(k.replace('methylation class ', ''));
      //pieData[1].push(cur[k]);
    });
    return pieData;
  };

  getGender = () => {
    let cur = {};
    let pieData = [];
    this.state.filteredData.map(row => {
      cur[row.gender] = cur[row.gender] + 1 || 1;
    });
    Object.keys(cur).forEach(k => {
      pieData.push([k, cur[k]]);
      //pieData[0].push(k);
      //pieData[1].push(cur[k]);
    });
    return pieData;
  };

  getAgeDistribution = () => {
    let cur = {};
    let pieData = [];
    this.state.filteredData.map(row => {
      cur[row.age] = cur[row.age] + 1 || 1;
    });
    Object.keys(cur).forEach(k => {
      pieData.push([k, cur[k]]);
    });
    return pieData;
  };
  renderMethylationLegend() {
    const list = this.getMethylationClasses().map((item, index) => (
      <div style={{ 'text-align': 'left' }}>
        <div
          className="color-box"
          style={{
            'background-color': this.backgroundColor[
              index % this.backgroundColor.length
            ]
          }}
        />
        {item[0]}
      </div>
    ));
    return list;
  }
  renderGenderLegend() {
    const list = this.getGender().map((item, index) => (
      <div style={{ 'text-align': 'left' }}>
        <div
          className="color-box"
          style={{
            'background-color': this.backgroundColor[
              index % this.backgroundColor.length
            ]
          }}
        />
        {item[0]}
      </div>
    ));
    return list;
  }
  render() {
    /*console.log(this.getMethylationClasses());
    console.log(this.getGender());
    const graph1 = this.graph1;
    var myChart = new Chart(graph1, {
      type: 'pie',
      options: {
        legend: {
          display: this.getMethylationClasses()[0].length <= 10,
          position: 'bottom',
          labels: {
            boxWidth: 10
          }
        }
      },
      data: {
        labels: this.getMethylationClasses()[0],
        datasets: [
          {
            data: this.getMethylationClasses()[1],
            backgroundColor: this.backgroundColor
          }
        ]
      }
    });
    const graph2 = this.graph2;
    var myChart2 = new Chart(graph2, {
      type: 'pie',
      options: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10
          }
        }
      },
      data: {
        labels: this.getGender()[0],
        datasets: [
          {
            data: this.getGender()[1],
            backgroundColor: this.backgroundColor
          }
        ]
      }
    });*/
    return (
      <div>
        <h3 style={{ 'text-align': 'center' }}>
          Project summary: {this.state.project}
        </h3>
        <br />
        <Row
          type="flex"
          justify="center"
          align="middle"
          style={{
            'padding-bottom': '100px',
            'padding-left': '30px',
            'padding-right': '30px'
          }}>
          <Col
            span={8}
            order={1}
            style={{ 'padding-left': '5px', 'padding-right': '5px' }}>
            <h4 className="summery-data-title">Methylation Classes</h4>
            <br />
            <PieChart
              height="350px"
              data={this.getMethylationClasses()}
              legend={false}
            />
            <div className="overflow-box" style={{ 'padding-left': '26px' }}>
              {this.renderMethylationLegend()}
            </div>
            {/*<h4 className="summery-data-title">Methylation Classes</h4>
            <br />
            <canvas
              style={{ width: '100%', height: '70%' }}
              ref={graph1 => (this.graph1 = graph1)}
              width="100%"
              height="70%"
  />*/}
          </Col>
          <Col
            span={8}
            order={2}
            style={{ 'padding-left': '5px', 'padding-right': '5px' }}>
            <h4 className="summery-data-title">Gender</h4>
            <br />
            {/*<canvas
              style={{ width: '100%', height: '70%' }}
              ref={graph2 => (this.graph2 = graph2)}
              width="100%"
              height="70%"
            />*/}
            <PieChart height="350px" data={this.getGender()} legend={false} />
            <div className="overflow-box" style={{ 'padding-left': '26px' }}>
              {this.renderGenderLegend()}
            </div>
          </Col>
          <Col
            span={8}
            order={3}
            style={{
              'margin-bottom': '84px',
              'padding-left': '5px',
              'padding-right': '5px'
            }}>
            <h4 className="summery-data-title">Age Distribution</h4>
            <br />
            <ColumnChart
              height="350px"
              data={this.getAgeDistribution()}
              library={{
                scales: { yAxes: [{ gridLines: { display: false } }] }
              }}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Summary;
