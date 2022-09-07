import React, { Component } from 'react'
import Plot from 'react-plotly.js';

// get masters of the block and render only the filter informations
export default class PlotlyGraph extends Component<any, any> {

    data: any[] = [];
    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const data = this.props.data;
        if (data) {
            console.log("visualizeData: ", data.visualizeData);
            data.visualizeData.map(dataElement => {
                const obj = {
                    type: "line",
                    x: this.getX(dataElement),
                    y: this.getY(dataElement)
                };
                this.data.push(obj);
            })
        }
    }
    getX = (data) => {
        const x: string[] = [];
        data.data.map(d => x.push(d.year))
        return x;
    }

    getY = (data) => {
        const y: string[] = [];
        data.data.map(d => y.push(d.value))
        return y;
    }
    render() {
        return (
            <Plot
                data={this.data}
                layout={{ width: this.props.width, height: this.props.height }}
            />
        )
    }
}
