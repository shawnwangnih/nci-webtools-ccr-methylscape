import React from 'react'
import Pie from './PieSVG'


class Summary extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      project: "",
      filteredData: [],
    }
  }



  componentWillReceiveProps(nextProps){
    if(nextProps.project == ""){
      this.setState({project:nextProps.data[1].project})
      this.filterData(nextProps.data[1].project, nextProps.data)
    }else{
      this.setState({project:nextProps.project})
      this.filterData(nextProps.project, nextProps.data)
    }
    this.getPieData()
  }

  filterData = (filter, data) => {
    this.setState({
      filteredData: data.filter( (row,i) => {
        row.key = i;
        return row.project.toLowerCase()
          .includes(filter.toLowerCase());
      })
    });
  }

   getPieData = () => {
    let cur = {}
    let pieData = []
    this.state.filteredData.map(row => {
      Object.values(row.classifier_prediction).forEach(cp => {
        Object.keys(cp).forEach(key => {
          cur[key] = (cur[key] + 1) || 1 ;
        })
      })
    })
    Object.keys(cur).forEach(k => {
        pieData.push({label:k, value:cur[k]})
    })
    return pieData
  }

  render(){
      return(
          <div>
            <h3>Project summery: {this.state.project}</h3>
            <div>
              <Pie
                data={this.getPieData()}
                width="100"
                heigth="100"
                innerRadius={10}
                outerRadius={50}
                />
            </div>
          </div>
      )
  }
}

export default Summary;
