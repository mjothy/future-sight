import React, { Component } from 'react';
import Plot from 'react-plotly.js';

// get masters of the block and render only the filter informations
export default class PlotlyGraph extends Component<any, any> {

    render() {
        const { currentBlock } = this.props;
        const config = {
            displayModeBar: false, // this is the line that hides the bar.
            editable: false,
            showlegend: currentBlock.config.configStyle.showLegend,
            showTitle: false
        };
        let layout: any = {
            width: this.props.width, height: this.props.height, legend: { "orientation": "h" },
            autosize: false,
            margin: {
                l: 40,
                r: 40,
                b: 40,
                t: 40,
                pad: 4
            },
            font: {
                size: 10
            }
        };
        if (currentBlock.config.configStyle.title.isVisible) {
            layout = { ...layout, title: currentBlock.config.configStyle.title.value };
        }

        return (
            <Plot
                key={this.props.currentBlock.id}
                data={this.props.data}
                layout={layout}
                config={config}
            />
        )
    }
}
