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
//import Help from '../home/components/Help'
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
    this.setState({
      current: e.key,
      filter: {
        project: '',
        experiment: ''
      }
    });
  };

  changeTab = (activeTab, filter = {}) => {
    this.setState({ current: activeTab, filter: filter });
    console.log(
      this.state.activeTab +
        ', ' +
        JSON.stringify(this.state.filter) +
        ', ' +
        JSON.stringify(this.state.data)
    );
  };

  renderMain() {
    return (
      <Home
        current={this.state.current}
        changeTab={this.changeTab}
        filter={this.state.filter}
      />
    );
  }
  render() {
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
              height: 'auto',
              // theme: 'light',
              background: '#f0f2f5',
              // position: 'fixed',
              zIndex: 1,
              width: '100%',
              padding: '0'
            }}>
            <div
              style={{
                padding: '0 50px',
                'max-width': '1400px',
                width: '100%',
                'margin-right': 'auto',
                'margin-left': 'auto'
              }}>
              <a href="https://ccr.cancer.gov/" target="_blank">
                <img
                  height="auto"
                  className="logo"
                  src="./assets/img/NIH_NCI_Logo_Grey.svg"
                  alt="National Cancer Institute"
                  width="80%"
                  style={{'padding-top':'20px', 'padding-bottom':'20px'}}
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
              'border-bottom': '0',
              // position: 'fixed',

              background: 'steelblue'
            }}>
            <div
              style={{
                padding: '0px 50px',
                'max-width': '1400px',
                width: '100%',
                'margin-right': 'auto',
                'margin-left': 'auto'
              }}>
              <Menu
                onClick={this.handleClick}
                selectedKeys={[this.state.current]}
                theme="dark"
                mode="horizontal"
                style={{
                  width: '100%',
                  height: '40px',
                  lineHeight: '40px',
                  'background-color': 'steelblue'
                }}>
                {/* Home */}
                <Menu.Item key="projects">
                  <Link
                    style={{
                      color: 'white',
                      'font-size': '16px',
                      'font-weight': '600'
                    }}>
                    Project
                  </Link>
                </Menu.Item>

                <Menu.Item key="experiments">
                  <Link
                    style={{
                      color: 'white',
                      'font-size': '16px',
                      'font-weight': '600'
                    }}>
                    Experiments
                  </Link>
                </Menu.Item>

                <Menu.Item key="samples">
                  <Link
                    style={{
                      color: 'white',
                      'font-size': '16px',
                      'font-weight': '600'
                    }}>
                    Samples
                  </Link>
                </Menu.Item>

                <Menu.Item key="help">
                  <Link
                    style={{
                      color: 'white',
                      'font-size': '16px',
                      'font-weight': '600'
                    }}>
                    Help
                  </Link>
                </Menu.Item>
              </Menu>
            </div>
          </Header>
          <Content
            style={{
              padding: '0 50px',
              height: '100%',
              'max-width': '1400px',
              width: '100%',
              'margin-right': 'auto',
              'margin-left': 'auto'
            }}>
            <div
              style={{
                background: '#fff',
                minHeight: 380
              }}>
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
