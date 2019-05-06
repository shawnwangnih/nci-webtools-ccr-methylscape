import React from 'react'
import { Route } from 'react-router-dom'
import Home from '../home'
import CNSProfiling from "../cnsprofiling"
import Help from "../help"

import { Layout } from "antd"
import Navbar from "./components/navbar"
import FooterContent from "./components/footer"
import HeaderContent from './components/header'

const { Header, Content, Footer } = Layout

const App = () => (
  <div>
    <Layout>
        <Header
          style={{
            theme: "light",
            background: "#fff",
            position: "fixed",
            zIndex: 1,
            width: "100%",
            padding: '0 50px'
          }}
        >
          <HeaderContent />
        </Header>
        <Content
          style={{ padding: "10px 50px", marginTop: 64 }}
        >
        <div><h2>MethylScape</h2></div>
          <Navbar/>
          <div style={{ background: "#fff", padding: 24, minHeight: 380 }}>
            <Route exact path="/" component={Home} />
            <Route exact path="/cns-profiling" component={CNSProfiling} />
            <Route exact path="/help" component={Help} />
          </div>
        </Content>

        <Footer style={{ textAlign: "center" }}>
          <FooterContent />
        </Footer>
      </Layout>
  </div>
 
)

export default App
