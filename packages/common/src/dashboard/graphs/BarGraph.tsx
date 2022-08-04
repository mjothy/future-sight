import React, { Component } from 'react'
import Plot from 'react-plotly.js';

export default class BarGraph extends Component<any, any> {

    constructor(props) {
        super(props);
    }
    render() {
        const data = this.props.data;

        const getX = () => {
            const x: string[] = [];
            data.data.map(d => x.push(d.year))
            return x;
        }

        const getY = () => {
            const y: string[] = [];
            data.data.map(d => y.push(d.value))
            return y;
        }
        return (
            <Plot  
                data={[
                    { type: 'bar', x: getX(), y: getY() },
                ]}
                layout={{ width: this.props.width, height: this.props.height, title: data.model + '/' + data.scenario }}
            />
        )
    }
}
