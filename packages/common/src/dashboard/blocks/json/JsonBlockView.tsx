import React from 'react';
import * as _ from 'lodash';
import Plot from 'react-plotly.js';

interface JsonBlockViewProps {
  currentBlock: any;
  width: any;
  height: any;
}


export default class JsonBlockView extends React.Component<JsonBlockViewProps, any> {

  shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean {
    let shouldUpdate = true;
    const config1 = nextProps.currentBlock.config;
    const config2 = this.props.currentBlock.config;
    // Check configuration
    if (this.props.width == nextProps.width && this.props.height == nextProps.height) {
      if (_.isEqual(config1, config2)) {
        shouldUpdate = false;
      }
    }
    return shouldUpdate;
  }

  getMargins = () => {
    return {
        l: 60,
        r: 10,
        b: 30,
        t: 5,
        pad: 4,
    }
  }

  render() {
    let layout = this.props.currentBlock.config.json.layout
    let data = this.props.currentBlock.config.json.data
    let config = this.props.currentBlock.config.json.config
    let frames = this.props.currentBlock.config.json.frames
    if (!layout || !data) {
      return <i>No data</i>
    }
    const baseLayout = {
        width: this.props.width,
        height: this.props.height,
        margin: this.getMargins(),
        font: {
            size: 10,
        },
        dragmode: "zoom",
        xaxis: {
            automargin: true
        }
    };
    layout = Object.assign(layout, baseLayout)
    return (
      <Plot
          key={this.props.currentBlock.id}
          data={data}
          layout={layout}
          config={config}
          frames={frames}
      />
    );
  }
}
