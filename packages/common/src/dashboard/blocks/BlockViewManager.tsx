import React, { Component } from 'react';
import ControlBlockView from './control/ControlBlockView';
import DataBlockView from './data/DataBlockView';
import TextBlockView from './text/TextBlockView';



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
        return <TextBlockView currentBlock= {this.props.currentBlock} />;
      case 'data':
        return <DataBlockView {...{
          currentBlock: this.props.currentBlock,
          blockData: this.props.blockData,
          width: this.props.width,
          height: this.props.height,
        }} />;
      case 'control':
        return <ControlBlockView {...{
          dashboard: this.props.dashboard,
          currentBlock: this.props.currentBlock,
          optionsLabel: this.props.optionsLabel,
          updateDashboard: this.props.updateDashboard
        }} />;
      default:
        return <p>Error !</p>;
    }
  };
  render() {
    return this.blockByType();
  }
}
