import React, { Component } from 'react';
import MapBlock from '../graphs/MapBlock';
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
        return <TextBlockView currentBlock={this.props.currentBlock} />;
      case 'data':
        return <DataBlockView {...{
          dashboard: this.props.dashboard,
          blockPlotData: this.props.plotData[this.props.currentBlock.id],
          currentBlock: this.props.currentBlock,
          blockData: this.props.blockData,
          width: this.props.width,
          height: this.props.height,
          dataManager: this.props.dataManager
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
    // return <MapBlock width={this.props.width} height={this.props.height} />;

  }
}
