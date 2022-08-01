import React, { Component } from 'react'
import Plot from 'react-plotly.js';

// Responsability choise the block

export default class Block extends Component<any,any> {

  constructor(props){
    super(props);
  }
  render() {
    const data = this.props.data;  
    
    const getX = () => {
      const x :string[]= []; 
      data.data.map(d => x.push(d.year))
      return x;
    }

    const getY = () => {
      const y :string[]= []; 
      data.data.map(d => y.push(d.value))
      return y;
    }

    return (  
      <div>
      <Plot
        data={[
          {
            x: getX(),
            y: getY(),
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: 'red'},
          },
          {type: 'bar', x: getX(), y: getY()},
        ]}
        layout={ {width: 300, height: 250, title: data.model + '/'+data.scenario} }
      />
      </div>
        )
  }
}
