import React from 'react';
import { Route, Link } from 'react-router-dom';
import { Alert, Tabs, PageHeader, Menu } from 'antd';
import Summary from './components/Summary';
import Experiments from './components/Experiments';
import Samples from './components/Samples';
import Projects from './components/Projects';

import { connect } from 'react-redux';

// import AWS from 'aws-sdk';

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

  failedScanSetPage(error) {
    console.log(error);
    this.setState({ showErrorAlert: true });
  }

  successScan(data) {
    this.setState({
      data: data,
      scanCheck: false
    });
  }

  async componentDidMount() {
    console.log('*************');
    console.log(process.env.NODE_ENV);
    const root =
      process.env.NODE_ENV === 'development'
        ? 'http://0.0.0.0:9000/'
        : window.location.pathname;
    console.log(`${root}/scanMethylScapeTable`);
    console.log('PATH NAME ', window.location.pathname);
    fetch(`${root}scanMethylScapeTable`)
      .then(response => response.json())
      .then(data => this.successScan(data))
      .catch(error => this.failedScanSetPage(error));
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
