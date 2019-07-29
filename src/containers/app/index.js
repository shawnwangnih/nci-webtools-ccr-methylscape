import React from 'react';
import { Route, Link } from 'react-router-dom';
import Home from '../home';
// import CNSProfiling from "../cnsprofiling";
// import Help from "../help";
// import ProjectPage from "../project"

import { Layout, Menu } from 'antd';
import FooterContent from './components/footer';

const { Header, Content, Footer } = Layout;

class App extends React.Component {
  state = {
    current: 'home'
  };
  handleClick = e => {
    // console.log(withRouter);

    console.log('click ', e);
    this.setState({
      current: e.key
    });
  };
  render() {
    return (
      <div>
        <Layout>
          <Header
            className="header"
            style={{
              height: '60px',
              theme: 'light',
              background: '#fff',
              position: 'fixed',
              zIndex: 1,
              width: '100%',
              padding: '0 50px'
            }}>
            <div>
              {' '}
              <a href="https://ccr.cancer.gov/">
                <img
                  className="logo"
                  src="./assets/img/nci-ccr-logo.png"
                  alt="National Cancer Institute"
                />
              </a>
            </div>
            {/* <Menu
              onClick={this.handleClick}
              selectedKeys={[this.state.current]}
              theme="light"
              mode="horizontal"
              style={{
                width: "100%",
                height: "60px",
                lineHeight: "60px",
                align: "right"
              }}
            >
              <Menu.Item key="home">
                <Link to="/">Home</Link>
              </Menu.Item>

              <Menu.Item key="cns">
                <Link to="/cns-profiling">CNS Profiling</Link>
              </Menu.Item>

              <Menu.Item key="help">
                <Link to="/help">Help</Link>
              </Menu.Item>
            </Menu> */}
          </Header>
          <Content
            style={{ padding: '10px 50px', marginTop: 64, height: '100%' }}>
            {/* <div>
              <h2>MethylScape</h2>
            </div> */}
            <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
              <Home />
              {/* <Route exact path="/" component={Home} /> */}
              {/* <Route exact path="/cns-profiling" component={CNSProfiling} />
              <Route exact path="/help" component={Help} />
              <Route exact path="/project-page/:id" component={ProjectPage} /> */}
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
