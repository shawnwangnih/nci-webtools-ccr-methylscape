import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

class Navbar extends React.Component {
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
      <Menu
        onClick={this.handleClick}
        selectedKeys={[this.state.current]}
        mode="horizontal"
        theme="light">
        <Menu.Item key="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Item key="cns">
          <Link to="/cns-profiling">CNS Profiling</Link>
        </Menu.Item>

        <Menu.Item key="help">
          <Link to="/help">Help</Link>
        </Menu.Item>
      </Menu>
    );
  }
}

export default Navbar;
