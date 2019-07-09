import React from 'react'
import { Route , Link} from "react-router-dom";
import { Tabs, PageHeader } from "antd";
// import Summary from "./components/Summary";
import Experiments from "./components/Experiments";
import Samples from "./components/Samples";
import Projects from "./components/Projects";
import AWS from 'aws-sdk'


import { connect } from 'react-redux'

const TabPane = Tabs.TabPane;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      // key: "project"
    }
    this.handler = this.handler.bind(this)
  };

  async handler(someValue) {
    this.setState({
      key: someValue
    })
  }

  async componentDidMount() {
    await this.scanTable()
  }

  async callback(key) {
    console.log(key);
  }


  async scanTable() {

    var documentClient = new AWS.DynamoDB.DocumentClient(
      {
        apiVersion: '2012-08-10',
        "region": 'us-east-1',

      });
    const params = { TableName: "MethylscapeSamples-prod" }
    let scanResults = [];
    let items;
    do{
        items =  await documentClient.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey  = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey != "undefined");
    this.setState({data:scanResults})
};

  render() {
    return (
      <div>
        {/* <PageHeader /> */}
        <Tabs >
          <TabPane tab="Project" key="project" >
            <Projects data={this.state.data} action={this.handler} />
          </TabPane>
          <TabPane tab="Experiments" key="experiments">
            <Experiments data={this.state.data}/>
          </TabPane>
          <TabPane tab="Samples" key="samples">
            <Samples data={this.state.data}/>
          </TabPane>
        </Tabs>
      </div>
    )
  }

}

export default connect(
)(Home)
