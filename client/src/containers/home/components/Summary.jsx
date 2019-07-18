import React from 'react'
import Pie from './PieSVG'


class Summary extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      project: "",
      filteredData: []
    }
  }



  componentWillReceiveProps(nextProps){
    console.log("3------", nextProps.project)
    // this.setState({data:nextProps.data}, () => {
      if(nextProps.project == ""){
        this.setState({project:nextProps.data[1].project})
        this.setState({data:this.filterData(nextProps.data[1].project)})
      }else{
        console.log("4--------", nextProps.project)
        this.setState({project:nextProps.project})
        this.setState({data:this.filterData(nextProps.project)})
      }
    // })
  }

  filterData = (filter) => {
    console.log("FILTER: ", filter)
    // this.setState({
    // return this.state.data.filter(row => {
    //     return row.project.toLowerCase()
    //       .includes(filter.toLowerCase());
    //   })
    // });
  }

  render(){
      return(
          <div>
            <h2>Project summery: {this.state.project}</h2>
            <div>
              {/* <Pie data={this.getData(this.state.project)} width="100px" heigth="100px"/> */}
            </div>
          </div>
      )
  }
}

export default Summary;
