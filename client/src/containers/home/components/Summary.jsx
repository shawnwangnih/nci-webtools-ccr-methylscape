import React from 'react';
// import { Container, Row, Col } from 'react-bootstrap';
import { Row, Col } from 'antd';
import { ColumnChart, PieChart } from 'react-chartkick';
import 'chart.js';

class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      project: '',
      filteredData: []
    };
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

  render() {
    return (
      <div>
        <h3 style={{ 'text-align': 'center' }}>
          Project summary: {this.state.project}
        </h3>
        <br />
        <Row type="flex" justify="center" align="middle">
          <Col span={8} order={1}>
            <h4 className="summery-data-title">Methylation Classes</h4>
            <br />
            <PieChart data={this.getMethylationClasses()} legend="bottom" />
          </Col>
          <Col span={8} order={2}>
            <h4 className="summery-data-title">Gender</h4>
            <br />
            <PieChart
              data={this.getGender()}
              legend="bottom"
              options={{ legend: { boxWidth: '2px' } }}
            />
          </Col>
          <Col span={8} order={3}>
            <h4 className="summery-data-title">Age Distribution</h4>
            <br />
            <ColumnChart data={this.getAgeDistribution()} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Summary;
