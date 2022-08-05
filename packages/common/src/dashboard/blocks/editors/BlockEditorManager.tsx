import React, { Component } from 'react'
import ControlBlock from './ControlBlock';
import DataBlock from './DataBlock';
import TextBlock from './TextBlock';

// Responsability choise the block

export default class BlockEditorManager extends Component<any, any> {

  constructor(props) {
    super(props);
  }

  blockByType = () => {
    const type = this.props.type;
    switch (type) {
      case "data":
        return <DataBlock {...this.props} />
      case "text":
        return <TextBlock {...this.props} />
      case "control":
        return <ControlBlock {...this.props} />
    }
  }
  render() {
    return this.blockByType()
  }
}
