import React from 'react';
// import { Route, Link } from 'react-router-dom';
import { Alert, Tabs } from 'antd';
import Summary from './components/Summary';
import Experiments from './components/Experiments';
import Samples from './components/Samples';
import Projects from './components/Projects';

import { connect } from 'react-redux';

const TabPane = Tabs.TabPane;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: props.current,
      data: [],
      filter: {
        project: '',
        experiment: ''
      },
      scanCheck: true,
      showErrorAlert: false,
      projectSummery: '',
      current: props.current
    };
  }

  changeTab = (activeTab, filter = {}) => {
    if (this.filter !== {}) {
      this.setState({ filter });
      if (filter.project) {
        this.changeSummeryPorject(filter.project);
      }
    }
    this.props.changeTab(activeTab, filter);
    this.setState({ activeTab });
  };

  changeSummeryPorject = projectSummery => {
    this.setState({ projectSummery });
    console.log(this.state.projectSummery);
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
  renderPage() {
    if (this.props.current == 'projects') {
      return (
        <div disabled={this.state.scanCheck}>
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
        </div>
      );
    }
    if (this.props.current == 'experiments') {
      return (
        <div>
          <Experiments
            data={this.state.data}
            changeTab={this.changeTab}
            filter={this.state.filter}
          />
        </div>
      );
    }
    if (this.props.current == 'samples') {
      return (
        <div>
          <Samples
            data={this.state.data}
            changeTab={this.changeTab}
            filter={this.state.filter}
          />
        </div>
      );
    } else {
      return (
        <div>
          <p>Help Info</p>
        </div>
      );
    }
  }
  render() {
    let page = this.renderPage();
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
        {/*this.renderPage()*/}
        {/*}
        <div
          hidden={this.props.current != 'projects'}
          disabled={this.state.scanCheck}>
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
        </div>
        <div hidden={this.props.current != 'experiments'}>
          <Experiments
            data={this.state.data}
            changeTab={this.changeTab}
            filter={this.state.filter}
          />
        </div>
        <div hidden={this.props.current != 'samples'}>
          <Samples
            data={this.state.data}
            changeTab={this.changeTab}
            filter={this.state.filter}
          />
        </div>
        <div hidden={this.props.current != 'help'}>
          <p>Help Info</p>
        </div>*/}
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
          <TabPane tab="Help" key="help" disabled={this.state.scanCheck}>
            <p>Help Info</p>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect()(Home);
