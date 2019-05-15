import React from "react";
import { connect } from "react-redux";
import { Tabs, PageHeader } from "antd";

import Summary from "./components/summary";
import Experiments from "./components/experiments";
import Samples from "./components/samples";

const TabPane = Tabs.TabPane;

function callback(key) {
  console.log(key);
}

class ProjectPage extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      projectID: props.match.params.id
    };
  }
  render() {
    return (
      <div>
        <PageHeader onBack={() => null} title={this.state.projectID} />
        <Tabs defaultActiveKey="summary" onChange={callback}>
          <TabPane tab="Summary" key="summary">
            <Summary />
          </TabPane>
          <TabPane tab="Experiments" key="experiments">
            <Experiments />
          </TabPane>
          <TabPane tab="Samples" key="samples">
            <Samples />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect()(ProjectPage);
