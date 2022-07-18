import React, { Component } from 'react'
import Plot from 'react-plotly.js';

// Responsability choise the block

export default class Block extends Component<any,any> {
  render() {
    console.log("Block props: ", this.props.item)
    console.log("Block key: ", this.props.type)

    return (        
      <Plot
        data={[
          {
            x: [1, 2, 3],
            y: [2, 6, 3],
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: 'red'},
          },
          {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
        ]}
        layout={ {width: 320, height: 240, title: 'A Fancy Plot'} }
      />
        )
  }
}
