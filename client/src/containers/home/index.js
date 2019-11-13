import React from 'react';
// import { Route, Link } from 'react-router-dom';
import { Alert, Tabs } from 'antd';
import Summary from './components/Summary';
import Experiments from './components/Experiments';
import Samples from './components/Samples';
import Projects from './components/Projects';
import Help from './components/Help';

import { connect } from 'react-redux';

const TabPane = Tabs.TabPane;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: props.current,
      data: [],
      filter: props.filter,
      scanCheck: true,
      showErrorAlert: false,
      projectSummery: '',
      current: props.current
    };
  }
  async componentWillReceiveProps(nextProps) {
    this.setState({ filter: nextProps.filter });
  }
  changeTab = (activeTab, filter = {}) => {
    if (activeTab == 'projects') {
      if (this.filter !== {}) {
        if (filter.project) {
          this.changeSummeryPorject(filter.project);
        }
      }
      this.props.changeTab(activeTab, {});
      this.setState({ activeTab });
    } else {
      if (this.filter !== {}) {
        this.setState({ filter });
        if (filter.project) {
          this.changeSummeryPorject(filter.project);
        }
      }
      this.props.changeTab(activeTab, filter);
      this.setState({ activeTab });
    }
  };

  changeSummeryPorject = projectSummery => {
    this.setState({ projectSummery });
  };

  failedScanSetPage(error) {
    this.setState({ showErrorAlert: true });
  }

  successScan(data) {
    this.setState({
      data: data,
      scanCheck: false
    });
  }

  async componentDidMount() {
    const root =
      process.env.NODE_ENV === 'development'
        ? 'http://0.0.0.0:8290/'
        : window.location.pathname;
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
          tabPosition="top"
          activeKey={this.props.current}
          onChange={this.changeTab}
          defaultActiveKey="projects">
          <TabPane tab="Project" key="projects" disabled={this.state.scanCheck}>
            <Projects
              data={this.state.data}
              changeTab={this.changeTab}
              filter={this.state.filter}
              project={this.state.projectSummery}
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
          <TabPane tab={<div><p>Help!!!</p></div>} key="help" disabled={this.state.scanCheck}>
            <Help />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect()(Home);
