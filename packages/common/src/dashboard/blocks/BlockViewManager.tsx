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
      case 'data':
        return <DataBlockView {...this.props} />;
      case 'text':
        return <TextBlockView {...this.props} />;
      case 'control':
        return <ControlBlockView {...this.props} />;
      default:
        return <p>Error !</p>;
    }
  };
  render() {
    // return this.blockByType();
    return <MapBlock width={this.props.width} height={this.props.height} />;

  }
}
