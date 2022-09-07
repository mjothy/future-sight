import React, { Component } from 'react'
import ControlBlock from './ControlBlock';
import DataBlock from './DataBlock';
import TextBlock from './TextBlock';
import PropTypes from 'prop-types';

/**
 * Render the view edit block according the the selected type
 */
export default class BlockEditorManager extends Component<any, any> {

  static propTypes = {
    blockType: PropTypes.string
  }

  constructor(props) {
    super(props);
  }

  blockByType = () => {
    const blockSelectedId = this.props.blockSelectedId;
    const blockType = this.props.data[blockSelectedId] ? this.props.data[blockSelectedId].blockType : "data";
    switch (blockType) {
      case "data":
        return <DataBlock {...this.props} />
      case "text":
        return <TextBlock {...this.props} />
      case "control":
        return <ControlBlock {...this.props} />
      default:
        return <p>Error !</p>
    }
  }
  render() {
    return this.blockByType()
  }
}
