import React from 'react';
import { Route, Link } from 'react-router-dom';
import { Alert, Tabs, PageHeader, Menu } from 'antd';
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
      scanCheck: true,
      showErrorAlert: false,
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

  async scanTable(tableName) {
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('IN DEV MODE');
    // const awsCreds = require('../../aws-credentials.json');
    // AWS.config.update({
    //   secretAccessKey: awsCreds.dynamoDBCredentials.secretKey,
    //   accessKeyId: awsCreds.dynamoDBCredentials.accessKey
    // });
    // } else {
    // var AWS = require('aws-sdk');
    // var default_credentials = new AWS.SharedIniFileCredentials({
    //   profile: 'default'
    // });
    // console.log(default_credentials);
    //   AWS.config.update({
    //     secretAccessKey: awsCreds.dynamoDBCredentials.secretKey,
    //     accessKeyId: awsCreds.dynamoDBCredentials.accessKey
    //   });
    // }

    if (process.env.NODE_ENV === 'development') {
      console.log('IN DEV MODE');
      const awsCreds = require('../../aws-credentials.json');
      AWS.config.update({
        secretAccessKey: awsCreds.dynamoDBCredentials.secretKey,
        accessKeyId: awsCreds.dynamoDBCredentials.accessKey
      });
      // } else {
      //   var AWS = require('aws-sdk');
      //   var default_credentials = new AWS.SharedIniFileCredentials({
      //     profile: 'default'
      //   });
    }
    AWS.config.update({
      region: 'us-east-1'
      // credentials: default_credentials
    });
    AWS.config.update({
      region: 'us-east-1'
      // credentials: default_credentials
    });
    var documentClient = new AWS.DynamoDB.DocumentClient({
      apiVersion: '2012-08-10'
    });
    const params = {
      TableName: tableName
    };
    let scanResults = [];
    let items;
    let failedScan = false;
    do {
      items = await documentClient
        .scan(params)
        .promise()
        .catch(error => {
          failedScan = true;
        });
      if (failedScan) {
        this.failedScanSetPage();
        break;
      }
      items.Items.forEach(item => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != 'undefined');
    if (scanResults.length > 0) {
      this.successScan();
    }
    return scanResults;
  }

  failedScanSetPage() {
    //TODO error msg
    this.setState({ showErrorAlert: true });
  }

  successScan() {
    this.setState({ scanCheck: false });
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
        {this.state.showErrorAlert && (
          <Alert
            message="Error"
            description="Failed to connect to table..."
            type="error"
            showIcon
          />
        )}
        <Tabs
          activeKey={this.state.activeTab}
          onChange={this.changeTab}
          defaultActiveKey="project">
          <TabPane tab="Project" key="projects" disabled={this.state.scanCheck}>
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
          <TabPane
            tab="Experiments"
            key="experiments"
            disabled={this.state.scanCheck}>
            <Experiments
              data={this.state.data}
              changeTab={this.changeTab}
              filter={this.state.filter}
            />
          </TabPane>
          <TabPane tab="Samples" key="samples" disabled={this.state.scanCheck}>
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
