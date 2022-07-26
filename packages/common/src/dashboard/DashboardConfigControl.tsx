import React, { Component } from 'react'
import BlockEditor from './BlockEditor'
import DashboardControl from './DashboardControl'
import SideBar from './sidebar/SideBar'

// Show {Edit selected block} OR {Add new block}
export default class DashboardConfigControl extends Component<any, any> {

  constructor(props) {
    super(props)
    this.state = {
      blockSelected: false
    }
  }

  render() {
    return (
      <SideBar handleSubmit={this.props.data.submitEvent}>
        {/* selected in props */}
        {this.state.blockSelected ? <BlockEditor />: <DashboardControl data={this.props.data} />}
      </SideBar>
    )
  }
}
