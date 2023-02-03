import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import * as _ from 'lodash';

interface TextBlockViewProps {
  currentBlock: any;
}


export default class TextBlockView extends React.Component<any, any> {

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

  render() {
    return <MDEditor.Markdown style={{ height: "100%", overflowY: "auto" }} source={this.props.currentBlock.config.value} />;
  }
}
