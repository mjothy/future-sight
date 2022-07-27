import React, { Component } from 'react'
import BlockEditor from './BlockEditor'
import DashboardControl from './DashboardControl'

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
      <div>
        {this.state.blockSelected ? <BlockEditor />: <DashboardControl {...this.props} />}
      </div>
    )
  }
}
