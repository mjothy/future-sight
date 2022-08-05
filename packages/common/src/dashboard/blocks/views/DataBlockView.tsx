import React, { Component } from 'react'
import BarGraph from '../../graphs/BarGraph'

export default class DataBlockView extends Component {
  render() {
    return <BarGraph {...this.props} />
  }
}
