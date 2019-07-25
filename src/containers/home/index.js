import React from 'react';
import { Route, Link } from 'react-router-dom';
import { Tabs, PageHeader, Menu } from 'antd';
import Summary from './components/Summary';
import Experiments from './components/Experiments';
import Samples from './components/Samples';
import Projects from './components/Projects';

import { connect } from 'react-redux';

import AWS from 'aws-sdk';

const TabPane = Tabs.TabPane;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'projects',
      data: [],
      filter: {
        project: '',
        experiment: ''
      },
      projectSummery: ''
    };
  }

  changeTab = (activeTab, filter = {}) => {
    if (this.filter != {}) {
      this.setState({ filter });
      console.log('FILTER *********', filter.project);
      if (filter.project) {
        this.changeSummeryPorject(filter.project);
      }
    }
    this.setState({ activeTab });
  };

  changeSummeryPorject = projectSummery => {
    // this.setState({ [filter project:projectSummery });
    this.setState({ projectSummery });
  };

  // updateSummeryData = (filter) => {
  // }

  async scanTable(tableName) {
    if (process.env.NODE_ENV === 'development') {
      console.log('IN DEV MODE');
      const awsCreds = require('../../aws-credentials.json');
      AWS.config.update({
        secretAccessKey: awsCreds.dynamoDBCredentials.secretKey,
        accessKeyId: awsCreds.dynamoDBCredentials.accessKey
      });
    } else {
      var AWS = require('aws-sdk');
      var default_credentials = new AWS.SharedIniFileCredentials({
        profile: 'default'
      });
    }
    AWS.config.update({
      region: 'us-east-1',
      credentials: default_credentials
    });
    var documentClient = new AWS.DynamoDB.DocumentClient({
      apiVersion: '2012-08-10'
    });
    const params = {
      TableName: tableName
    };
    let scanResults = [];
    let items;
    do {
      items = await documentClient.scan(params).promise();
      items.Items.forEach(item => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != 'undefined');
    return scanResults;
  }

  async componentDidMount() {
    console.log('AWS_TEST');
    this.scanTable('MethylscapeSamples-prod').then((data, error) => {
      if (error) {
        console.log('ERROR', error);
      }
      if (data) {
        console.log('DATA', data);
        this.setState({ data });
        this.setState({ loading: false });
      }
    });
  }

  render() {
    return (
      <div>
        {/* <PageHeader /> */}
        <Tabs
          activeKey={this.state.activeTab}
          onChange={this.changeTab}
          defaultActiveKey="project">
          <TabPane tab="Project" key="projects">
            <Projects
              data={this.state.data}
              changeTab={this.changeTab}
              filter={this.state.filter}
              changeSummeryPorject={this.changeSummeryPorject}
            />
            <Summary
              data={this.state.data}
              project={this.state.projectSummery}
              changeSummeryPorject={this.changeSummeryPorject}
            />
          </TabPane>
          <TabPane tab="Experiments" key="experiments">
            <Experiments
              data={this.state.data}
              changeTab={this.changeTab}
              filter={this.state.filter}
            />
          </TabPane>
          <TabPane tab="Samples" key="samples">
            <Samples
              data={this.state.data}
              changeTab={this.changeTab}
              filter={this.state.filter}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect()(Home);
