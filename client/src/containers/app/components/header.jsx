import React from 'react'
import { Link } from 'react-router-dom'
import { Layout, Menu} from 'antd'

const { Header} = Layout

class Header extends React.Component {
    state = {
        current: 'home',
    }
    handleClick = (e) => {
        console.log('click ', e);
        this.setState({
          current: e.key,
        });
    }
    render() {
        return (
            <Header className="header" style={{
                height: '60px',
                theme: "light",
                background: "#fff",
                position: "fixed",
                zIndex: 1,
                width: "100%",
                padding: '0 50px'
              }}>
              <div> <a href="https://ccr.cancer.gov/"><img className='logo' src='/assets/img/nci-ccr-logo.png' alt='National Cancer Institute'></img></a></div>
                <Menu
                    onClick={this.handleClick}
                    selectedKeys={[this.state.current]}
                    theme="light"
                    mode="horizontal"
                    style={{ 
                        width: "100%",
                        height: '60px',
                        lineHeight: '60px',
                        align: 'right' }}
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
                </Menu>
            </Header>
        )
    }

}


export default Header
