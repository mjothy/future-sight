import { Table } from 'antd';
import React, { Component } from 'react';
import Plot from 'react-plotly.js';

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
            },
            hoverInfo: "djjdjdjd"
        };
        if (currentBlock.config.configStyle.title.isVisible) {
            layout = { ...layout, title: currentBlock.config.configStyle.title.value };
        }

        return (

            currentBlock.config.configStyle.graphType === "table" ?
                <Table
                    // Make the height 100% of the div (not working)
                    style={{ minHeight: "100%" }}
                    columns={this.props.data.columns}
                    dataSource={this.props.data.values}
                    pagination={false}
                    scroll={{ x: 3000, y: this.props.height - 40 }}
                    bordered
                />
                :
                <Plot
                    key={this.props.currentBlock.id}
                    data={this.props.data}
                    layout={layout}
                    config={config}
                />
        )
    }
}
