import React, { Component } from 'react';
import Plot from 'react-plotly.js';

// get masters of the block and render only the filter informations

const config = {
  displayModeBar: false, // this is the line that hides the bar.
  editable: false,
  showlegend: true,
};

export default class PlotlyGraph extends Component<any, any> {
  render() {
    return (
      <Plot
        key={this.props.currentBlock.id}
        data={this.props.data}
        layout={{
          width: this.props.width,
          height: this.props.height,
          title: 'title',
          legend: { orientation: 'h' },
        }}
        config={config}
      />
    );
  }
}
