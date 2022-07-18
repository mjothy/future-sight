/* eslint-disable react/prop-types */
import React, { Component } from 'react'

export default class DashboardManager extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}
