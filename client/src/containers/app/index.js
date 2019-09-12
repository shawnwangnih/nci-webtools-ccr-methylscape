import React from 'react';
import { Route, Link } from 'react-router-dom';
import Home from '../home';
import CNSProfiling from '../cnsprofiling';
import Help from '../help';
// import ProjectPage from "../project"
import Summary from '../home/components/Summary';
import Experiments from '../home/components/Experiments';
import Samples from '../home/components/Samples';
import Projects from '../home/components/Projects';
import { Layout, Menu, PageHeader } from 'antd';
import FooterContent from './components/footer';
import './index.css';

const { Header, Content, Footer } = Layout;

class App extends React.Component {
  state = {
    current: 'projects',
    data: [],
    filter: {
      project: '',
      experiment: ''
    },
    scanCheck: true,
    showErrorAlert: false,
    projectSummery: ''
  };
  handleClick = e => {
    console.log('click ', e);
    this.setState({
      current: e.key
    });
  };

  changeTab = (activeTab, filter = {}) => {
    if (this.filter !== {}) {
      this.setState({ filter });
      if (filter.project) {
        this.changeSummeryPorject(filter.project);
      }
    }
    this.setState({ current: activeTab });
  };

  renderContent() {
    if (this.state.current == 'projects') {
      return (
        <div>
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
    if (this.state.current == 'experiments') {
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
    if (this.state.current == 'samples') {
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
  renderMain() {
    return <Home current={this.state.current} changeTab={this.changeTab} />;
  }
  render() {
    console.log('RERENDERING: ' + this.state.current);
    let bodyContent = this.renderContent();
    let mainContent = this.renderMain();
    return (
      <div>
        <Layout
          style={
            {
              // background: 'black',
            }
          }>
          <Header
            className="header"
            style={{
              height: '90px',
              // theme: 'light',
              background: 'back',
              // position: 'fixed',
              zIndex: 1,
              width: '100%'
            }}>
            <div
              style={{
                padding: '0px 50px',
                'max-width': '1400px',
                width: '100%',
                'margin-right': 'auto',
                'margin-left': 'auto'
              }}>
              <a href="https://ccr.cancer.gov/">
                <img
                  className="logo"
                  src="./assets/img/test-2.svg"
                  alt="National Cancer Institute"
                />
              </a>
            </div>
          </Header>
          {/*
          <Header
            className="header"
            style={{
              height: '40px',
              theme: 'light',
              background: '#0d2943',
              // position: 'fixed',
              zIndex: 1,
              width: '100%',
              padding: '0 50px'
            }}>
          </Header>
 */}

          <Header
            className="header"
            style={{
              height: '40px',
              zIndex: 1,
              width: '100%',
              padding: '0 0px',
              // position: 'fixed',

              background: '#001529'
            }}>
            <Menu
              onClick={this.handleClick}
              selectedKeys={[this.state.current]}
              theme="light"
              mode="horizontal"
              style={{
                width: '100%',
                height: '40px',
                lineHeight: '40px'
              }}>
              {/* Home */}
              <Menu.Item key="projects">
                <Link to="">Project</Link>
              </Menu.Item>

              <Menu.Item key="experiments">
                <Link to="">Experiments</Link>
              </Menu.Item>

              <Menu.Item key="samples">
                <Link to="">Samples</Link>
              </Menu.Item>

              <Menu.Item key="help">
                <Link to="">Help</Link>
              </Menu.Item>
            </Menu>
          </Header>
          <Content
            style={{
              padding: '40px 50px',
              height: '100%',
              'max-width': '1400px',
              width: '100%',
              'margin-right': 'auto',
              'margin-left': 'auto'
            }}>
            <div
              style={{
                background: '#fff',
                'border-radius': '15px',
                padding: 24,
                minHeight: 380
              }}>
              {/*bodyContent*/}
              {mainContent}
              {/* <Route exact path="/methylscape" component={Home} />
              <Route
                exact
                path="/methylscape/cns-profiling"
                component={CNSProfiling}
              />
              <Route exact path="/methylscape/help" component={Help} /> */}
            </div>
          </Content>

          {/* <Footer style={{ textAlign: 'center' }}>
            <FooterContent />
          </Footer> */}
        </Layout>
      </div>
    );
  }
}
export default App;
