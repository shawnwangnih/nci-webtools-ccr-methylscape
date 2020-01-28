import React from 'react';
import { connect } from 'react-redux';
import { Tabs, PageHeader } from 'antd';

import Summary from './components/Summary';
import Experiments from './components/Experiments';
import Samples from './components/Samples';

const TabPane = Tabs.TabPane;

function callback(key) {
  console.log(key);
}

class ProjectPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectID: props.match.params.id,
      experiments: []
    };
  }

  //   componentDidMount() {
  //       fetch("http://localhost:5000/api/project", {
  //           method: "POST",
  //           headers: {
  //             'Accept': 'application/json',
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //             projectID: this.state.projectID,
  //           })
  //       })
  //       .then(res => res.json())
  //       .then(data => {
  //           console.log(data)
  //           this.setState({experiments: data})
  //       })
  //   }

  render() {
    return (
      <div>
        <PageHeader onBack={() => null} title={this.state.projectID} />
        <Tabs
          defaultActiveKey="summary"
          //onChange={callback}
          style={{ theme: 'dark' }}>
          <TabPane tab="Summary" key="summary">
            <Summary projectID={this.state.projectID} />
          </TabPane>
          <TabPane tab="Experiments" key="experiments">
            <Experiments projectID={this.state.projectID} />
          </TabPane>
          <TabPane tab="Samples" key="samples">
            <Samples projectID={this.state.projectID} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect()(ProjectPage);
