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
      filteredData: [],
      moreClasses: false,
      windowWidth: document.body.clientWidth,
      timeout: false
    };
    this.methylationHeight = 0;
    this.lastMethylationHeight = 0;
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
    this.setState({ moreClasses: false });
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
  componentDidMount() {
    window.addEventListener('resize', () => {
      clearTimeout(this.state.timeout);
      // start timing for event "completion"
      this.setState({
        timeout: setTimeout(() => {
          this.setState({ windowWidth: document.body.clientWidth }, () => {
            console.log(this.state.windowWidth);
          });
        }, 250)
      });
    });
  }
  async componentDidUpdate() {
    this.methylationHeight =
      document.getElementById('methylationLegend').clientHeight + 21 - 84;

    if (this.methylationHeight > this.lastMethylationHeight) {
      this.lastMethylationHeight = this.methylationHeight;
      this.setState({});
    }
    this.lastMethylationHeight = this.methylationHeight;
  }

  filterData = (filter, data) => {
    this.setState({
      filteredData: data.filter((row, i) => {
        row.key = i;
        if (row.project != null) {
          return row.project.toLowerCase().includes(filter.toLowerCase());
        } else {
          return false;
        }
      })
    });
  };

  getMethylationClasses = () => {
    let cur = {};
    let pieData = [];
    this.state.filteredData.map(row => {
      if (row.classifier_prediction != null) {
        if (Object.keys(row.classifier_prediction).length >= 2) {
          Object.keys(row.classifier_prediction).forEach(key => {
            if (key != '0') {
              Object.keys(row.classifier_prediction[key]).forEach(key1 => {
                cur[key1] = cur[key1] + 1 || 1;
              });
            }
          });
        } else {
          Object.values(row.classifier_prediction).forEach(cp => {
            Object.keys(cp).forEach(key => {
              cur[key] = cur[key] + 1 || 1;
            });
          });
        }
      }
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
      <div style={{ textAlign: 'left' }}>
        <div
          className="color-box"
          style={{
            backgroundColor: this.backgroundColor[
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
      <div style={{ textAlign: 'left' }}>
        <div
          className="color-box"
          style={{
            backgroundColor: this.backgroundColor[
              index % this.backgroundColor.length
            ]
          }}
        />
        {item[0]}
      </div>
    ));
    if (this.getMethylationClasses().length > 3) {
      if (this.state.moreClasses == true) {
        return (
          <div
            className="overflow-box"
            style={{
              paddingLeft: '51px',
              marginBottom: this.methylationHeight.toString() + 'px'
            }}>
            {list}
          </div>
        );
      } else {
        return (
          <div
            className="overflow-box"
            style={{ paddingLeft: '51px', marginBottom: '21px' }}>
            {list}
          </div>
        );
      }
    } else {
      return (
        <div className="overflow-box" style={{ paddingLeft: '51px' }}>
          {list}
        </div>
      );
    }
  }
  renderSmallGenderLegend() {
    const list = this.getGender().map((item, index) => (
      <div style={{ textAlign: 'left' }}>
        <div
          className="color-box"
          style={{
            backgroundColor: this.backgroundColor[
              index % this.backgroundColor.length
            ]
          }}
        />
        {item[0]}
      </div>
    ));

    return (
      <div
        className="overflow-box"
        style={{ 'max-width': '350px', margin: 'auto' }}>
        {list}
      </div>
    );
  }
  showMore() {
    this.setState({ moreClasses: true });
  }
  showLess() {
    this.setState({ moreClasses: false });
  }
  renderMore() {
    if (
      this.getMethylationClasses().length > 3 &&
      this.state.moreClasses == false
    ) {
      return (
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <a onClick={() => this.showMore()} style={{}}>
            show more
          </a>
        </div>
      );
    }
    if (this.state.moreClasses == true) {
      return (
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <a onClick={() => this.showLess()}>show less</a>
        </div>
      );
    }
    return <div />;
  }

  methylationLegend() {
    if (this.state.moreClasses == false) {
      return (
        <div
          id="methylationLegend"
          className="overflow-box"
          style={{ paddingLeft: '51px' }}>
          {this.renderMethylationLegend()}
        </div>
      );
    } else {
      return (
        <div
          id="methylationLegend"
          className="non-overflow-box"
          style={{ paddingLeft: '51px' }}>
          {this.renderMethylationLegend()}
        </div>
      );
    }
  }

  smallMethylationLegend() {
    if (this.state.moreClasses == false) {
      return (
        <div
          id="methylationLegend"
          className="overflow-box"
          style={{ 'max-width': '350px', margin: 'auto' }}>
          {this.renderMethylationLegend()}
        </div>
      );
    } else {
      return (
        <div
          id="methylationLegend"
          className="non-overflow-box"
          style={{ 'max-width': '350px', margin: 'auto' }}>
          {this.renderMethylationLegend()}
        </div>
      );
    }
  }

  renderColumnChart() {
    if (this.state.moreClasses == true) {
      return (
        <Col
          span={8}
          order={3}
          style={{
            marginBottom: (this.methylationHeight + 63).toString() + 'px',
            paddingLeft: '5px',
            paddingRight: '56px'
          }}>
          <h4 className="summery-data-title">Age Distribution</h4>
          <br />
          <ColumnChart
            height="300px"
            data={this.getAgeDistribution()}
            library={{
              scales: { yAxes: [{ gridLines: { display: false } }] }
            }}
          />
        </Col>
      );
    }
    return (
      <Col
        span={8}
        order={3}
        style={{
          marginBottom: '84px',
          paddingLeft: '5px',
          paddingRight: '56px'
        }}>
        <h4 className="summery-data-title">Age Distribution</h4>
        <br />
        <ColumnChart
          height="300px"
          data={this.getAgeDistribution()}
          library={{
            scales: { yAxes: [{ gridLines: { display: false } }] }
          }}
        />
      </Col>
    );
  }

  renderGraphs() {
    if (this.state.windowWidth >= 800) {
      return (
        <Row
          type="flex"
          justify="center"
          align="middle"
          style={{
            paddingBottom: '100px',
            paddingLeft: '30px',
            paddingRight: '30px'
          }}>
          <Col
            span={8}
            order={1}
            style={{ paddingLeft: '5px', paddingRight: '5px' }}>
            <h4 className="summery-data-title">Methylation Classes</h4>
            <br />
            <PieChart
              height="300px"
              data={this.getMethylationClasses()}
              legend={false}
            />

            {this.methylationLegend()}
            {/*
          <div className="overflow-box" style={{ 'paddingLeft': '51px' }}>
            {this.renderMethylationLegend()}
          </div>*/}
            {/*<h4 className="summery-data-title">Methylation Classes</h4>
          <br />
          <canvas
            style={{ width: '100%', height: '70%' }}
            ref={graph1 => (this.graph1 = graph1)}
            width="100%"
            height="70%"
/>*/}
            {this.renderMore()}
          </Col>
          <Col
            span={8}
            order={2}
            style={{ paddingLeft: '5px', paddingRight: '5px' }}>
            <h4 className="summery-data-title">Gender</h4>
            <br />
            {/*<canvas
            style={{ width: '100%', height: '70%' }}
            ref={graph2 => (this.graph2 = graph2)}
            width="100%"
            height="70%"
          />*/}
            <PieChart height="300px" data={this.getGender()} legend={false} />
            {/*<div className="overflow-box" style={{ 'paddingLeft': '51px' }}>
            {this.renderGenderLegend()}
        </div>*/}
            {this.renderGenderLegend()}
          </Col>
          {this.renderColumnChart()}
        </Row>
      );
    } else {
      return (
        <div>
          <h4 className="summery-data-title">Methylation Classes</h4>
          <br />
          <PieChart
            height="300px"
            data={this.getMethylationClasses()}
            legend={false}
          />
          {this.smallMethylationLegend()}
          {/*
          <div className="overflow-box" style={{ 'paddingLeft': '51px' }}>
            {this.renderMethylationLegend()}
          </div>*/}
          {/*<h4 className="summery-data-title">Methylation Classes</h4>
          <br />
          <canvas
            style={{ width: '100%', height: '70%' }}
            ref={graph1 => (this.graph1 = graph1)}
            width="100%"
            height="70%"
/>*/}
          {this.renderMore()}
          <br />
          <br />
          <h4 className="summery-data-title">Gender</h4>
          <br />
          {/*<canvas
            style={{ width: '100%', height: '70%' }}
            ref={graph2 => (this.graph2 = graph2)}
            width="100%"
            height="70%"
          />*/}
          <PieChart height="300px" data={this.getGender()} legend={false} />
          {/*<div className="overflow-box" style={{ 'paddingLeft': '51px' }}>
            {this.renderGenderLegend()}
        </div>*/}
          {this.renderSmallGenderLegend()}
          <br />
          <h4 className="summery-data-title">Age Distribution</h4>
          <br />
          <ColumnChart
            height="300px"
            data={this.getAgeDistribution()}
            library={{
              scales: { yAxes: [{ gridLines: { display: false } }] }
            }}
          />
        </div>
      );
    }
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
        <h3
          style={{
            textAlign: 'center',
            fontSize: '20px',
            color: '#0050d8',
            fontWeight: '600'
          }}>
          Project summary: {this.state.project} Project
        </h3>
        <br />
        {this.renderGraphs()}
      </div>
    );
  }
}

export default Summary;
