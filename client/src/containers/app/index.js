import React from 'react';
import { Route, Link } from 'react-router-dom';
import Home from '../home';
import CNSProfiling from '../cnsprofiling';
import Help from '../help';
// import ProjectPage from "../project"

import { Layout, Menu, PageHeader } from 'antd';
import FooterContent from './components/footer';

const { Header, Content, Footer } = Layout;

class App extends React.Component {
  state = {
    current: 'home'
  };
  handleClick = e => {
    console.log('click ', e);
    this.setState({
      current: e.key
    });
  };
  render() {
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
              width: '100%',
              padding: '0px 50px'
            }}>
            <div>
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
              padding: '0 50px',
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
              <Menu.Item key="home" disabled>
                <Link to="/methylscape">Home</Link>
              </Menu.Item>

              <Menu.Item key="cns" disabled>
                <Link to="/methylscape/cns-profiling">CNS Profiling</Link>
              </Menu.Item>

              <Menu.Item key="help" disabled>
                <Link to="/methylscape/help">Help</Link>
              </Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '10px 50px', height: '100%' }}>
            <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
              <Home />
              {/* <Route exact path="/methylscape" component={Home} />
              <Route
                exact
                path="/methylscape/cns-profiling"
                component={CNSProfiling}
              />
              <Route exact path="/methylscape/help" component={Help} /> */}
            </div>
          </Content>

          <Footer style={{ textAlign: 'center' }}>
            <FooterContent />
          </Footer>
        </Layout>
      </div>
    );
  }
}
export default App;
