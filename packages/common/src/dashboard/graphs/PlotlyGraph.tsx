import React, { Component } from 'react'
import Plot from 'react-plotly.js';

// get masters of the block and render only the filter informations
export default class PlotlyGraph extends Component<any, any> {

    render() {
        return (
            <Plot
                data={this.props.data}
                layout={{ width: this.props.width, height: this.props.height }}
            />
        )
    }
}
