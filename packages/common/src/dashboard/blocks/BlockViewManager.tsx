import React, { Component } from 'react';
import ControlBlockView from './control/ControlBlockView';
import TextBlockView from './text/TextBlockView';
import DataBlockTransfert from "./data/DataBlockTransfert";

/**
 * Render the view of block in Grid Layout
 */
export default class BlockViewManager extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  blockByType = () => {
    const blockType = this.props.currentBlock
      ? this.props.currentBlock.blockType
      : 'data';

    switch (blockType) {
      case 'text':
        return <TextBlockView currentBlock={this.props.currentBlock} />;
      case 'data':
        return <DataBlockTransfert
          currentBlock={this.props.currentBlock}
          blockData={this.props.blockData}
          plotData={this.props.plotData}
          width={this.props.width}
          height={this.props.height}
          checkDeprecatedVersion={this.props.checkDeprecatedVersion}
        />;
      case 'control':
        return <ControlBlockView
          dashboard={this.props.dashboard}
          currentBlock={this.props.currentBlock}
          optionsLabel={this.props.optionsLabel}
          updateDashboard={this.props.updateDashboard}
        />;
      default:
        return <p>Error !</p>;
    }
  };
  render() {
    return this.blockByType();
  }
}
