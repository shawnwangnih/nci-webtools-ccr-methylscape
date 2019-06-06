import React from 'react'
import * as d3 from 'd3'
import Pie from './PieSVG'


const Arc = ({ data, index, createArc, colors, format }) => (
    <g key={index} className="arc">
      <path className="arc" d={createArc(data)} fill={colors(index)} />
      <text
        transform={`translate(${createArc.centroid(data)})`}
        textAnchor="middle"
        alignmentBaseline="middle"
        fill="white"
        fontSize="10"
      >
        {format(data.value)}
      </text>
    </g>
  );
  


class Summary extends React.Component{

    constructor(props){
        super(props)
    }


    componentDidMount(){
    }

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
