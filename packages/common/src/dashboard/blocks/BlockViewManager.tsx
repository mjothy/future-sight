import React, { Component } from 'react';
import ControlBlockView from './control/ControlBlockView';
import TextBlockView from './text/TextBlockView';
import DataBlockTransfert from "./data/DataBlockTransfert";
import { getChildrens } from './utils/BlockDataUtils';
import ConfigurationModel from '../../models/ConfigurationModel';
import BlockDataModel from '../../models/BlockDataModel';

/**
 * Render the view of block in Grid Layout
 */
export default class BlockViewManager extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  getMetaData = (block) => {
    const config: ConfigurationModel | any = block.config;
    const metaData: BlockDataModel = config.metaData;
    return metaData
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
          parentBlock={this.props.dashboard.blocks[this.props.currentBlock.controlBlock]}
          blockData={this.props.blockData}
          plotData={this.props.plotData}
          width={this.props.width}
          height={this.props.height}
          checkDeprecatedVersion={this.props.checkDeprecatedVersion}
          getMetaData={this.getMetaData}
        />;
      case 'control':
        return <ControlBlockView
          dashboard={this.props.dashboard}
          currentBlock={this.props.currentBlock}
          optionsLabel={this.props.optionsLabel}
          updateDashboard={this.props.updateDashboard}
          blockData={this.props.blockData}
          getMetaData={this.getMetaData}
        />;
      default:
        return <p>Error !</p>;
    }
  };
  render() {
    return this.blockByType();
  }
}
