import React from 'react';
import * as _ from 'lodash';
import PlotlyGraph from "../../graphs/PlotlyGraph";

interface JsonBlockViewProps {
  currentBlock: any;
}


export default class JsonBlockView extends React.Component<JsonBlockViewProps, any> {

  shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean {
    let shouldUpdate = true;
    const config1 = nextProps.currentBlock.config;
    const config2 = this.props.currentBlock.config;
    // Check configuration
    if (_.isEqual(config1, config2)) {
      shouldUpdate = false;
    }

    return shouldUpdate;
  }

  render() {
    let layout = this.props.currentBlock.config.json.layout
    let data = this.props.currentBlock.config.json.data
    return (
        <PlotlyGraph {...this.props} data={data} layout={layout} />
    );
  }
}
