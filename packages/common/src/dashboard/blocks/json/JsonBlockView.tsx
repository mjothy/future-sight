import React from 'react';
import * as _ from 'lodash';
import Plot from 'react-plotly.js';
import { WarningOutlined } from '@ant-design/icons';

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

  getMargins = (layout) => {
    return {
      l: 60,
      r: 10,
      b: 30,
      t: layout.title ? 50 : 5,
      pad: 4,
  }
  }

  render() {
    let layout = Object.assign({}, this.props.currentBlock.config.json.layout);
    let data = this.props.currentBlock.config.json.data;
    let config = this.props.currentBlock.config.json.config;
    let frames = this.props.currentBlock.config.json.frames;
    if (!layout || !data) {
      return <i>No data</i>
    }
    layout = Object.assign(layout, {
      width: this.props.width,
      height: this.props.height,
      margin: this.getMargins(layout),
      font: {
          size: 10,
      },
      dragmode: "zoom",
      xaxis: {
          automargin: true
      }
    });
    return (
      <React.Fragment>
        <WarningOutlined 
          title="This chart was uploaded by the Author. Data might not come from the standard ECEMF database."
          style={{"position": "fixed", "top":"1px", "left":"1px", "zIndex": 2}}
          />
        <Plot
            key={this.props.currentBlock.id}
            data={data}
            layout={layout}
            config={config}
            frames={frames}
        />
      </React.Fragment>
    );
  }
}
