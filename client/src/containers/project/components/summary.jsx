import React from 'react'
import * as d3 from 'd3'


var exspenses = [
    {
        name: 'coofee',
        amount: 4,
        date: new Date()
    },{
        name: 'Safeway',
        amount: 46,
        date: new Date()
    },{
        name: 'Valero',
        amount: 40,
        date: new Date()
    }
]

var width = 900
var height = 900
var simulation = d3.forceSimulation()


class Summary extends React.Component{
    constructor(props){
        super(props)
        // this.state = {
        //     data = [30
    }

    temperatureData = [ 8, 5, 13, 9, 12 ];

    componentDidMount(){
        this.container = d3.select(this.refs.container)
        var circles = this.container.selectAll('circle')
            .data(exspenses, d => d.name)
    }

    // d3.select(this.refs.temperatures)
    //     .selectAll("h2")
    //     .data(temperatureData)
    //     .enter()
    //         .append("h2")
    //         .text("New Temperature")


    // componentDidMount() {
    //     fetch("http://localhost:5000/api/project/experiments", {
    //       method: "POST",
    //       headers: {
    //         Accept: "application/json",
    //         "Content-Type": "application/json"
    //       },
    //       body: JSON.stringify({
    //         projectID: this.state.projectID
    //       })
    //     })
    //       .then(res => res.json())
    //       .then(data => {
    //         console.log(data);
    //         this.setState({ experiments: data });
    //         this.setState({ filteredData: data });
    //         this.setState({ loading: false });
    //       });
    //   }

    render(){
        return(
            <div>
                <svg>

                </svg>
            </div>
        )
    }
}

export default Summary;
