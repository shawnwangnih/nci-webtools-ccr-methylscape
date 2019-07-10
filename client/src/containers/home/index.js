import React from "react";
import { Route, Link } from "react-router-dom";
import { Tabs, PageHeader } from "antd";
// import Summary from "./components/Summary";
import Experiments from "./components/Experiments";
import Samples from "./components/Samples";
import Projects from "./components/Projects";

import { connect } from "react-redux";

const TabPane = Tabs.TabPane;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
    this.handler = this.handler.bind(this);
  }

  async handler(someValue) {
    this.setState({
      key: someValue
    });
  }

  async componentDidMount() {
    fetch("http://localhost:5000/api/methylScapeTableData", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState({ data });
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      <div>
        {/* <PageHeader /> */}
        <Tabs>
          <TabPane tab="Project" key="project">
            <Projects data={this.state.data} action={this.handler} />
          </TabPane>
          <TabPane tab="Experiments" key="experiments">
            <Experiments data={this.state.data} />
          </TabPane>
          <TabPane tab="Samples" key="samples">
            <Samples data={this.state.data} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect()(Home);
