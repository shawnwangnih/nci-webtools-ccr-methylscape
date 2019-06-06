import React from 'react'
import { Tabs, PageHeader } from "antd";
import Summary from "./components/Summary";
import Experiments from "./components/Experiments";
import Samples from "./components/Samples";
import Projects from "./components/Projects";



import { connect } from 'react-redux'

const TabPane = Tabs.TabPane;

class Home extends React.Component {

  state = {
    projectID: "",
  };

  render() {
    return (
      <div>
        {/* <PageHeader /> */}
        <Tabs defaultActiveKey="project" style={{ theme: 'dark'}}>
          <TabPane tab="Project" key="project">
            <Projects projectID={this.state.projectID}/>
          </TabPane>
          <TabPane tab="Experiments" key="experiments">
            <Experiments projectID={this.state.projectID}/>
          </TabPane>
          <TabPane tab="Samples" key="samples">
            <Samples projectID={this.state.projectID}/>
          </TabPane>
        </Tabs>
      </div>
    )
  }

}

export default connect(
)(Home)
