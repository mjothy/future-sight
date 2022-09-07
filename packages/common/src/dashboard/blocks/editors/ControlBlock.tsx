import { Button } from 'antd'
import React, { Component } from 'react'

export default class ControlBlock extends Component<any,any> {
  render() {
    const onAddControlledBlock = () =>{
      this.props.addBlock("data", this.props.blockSelectedId);
    }
    return (
      <div>
        <Button onClick={onAddControlledBlock}>Add data block</Button>
      </div>
    )
  }
}
