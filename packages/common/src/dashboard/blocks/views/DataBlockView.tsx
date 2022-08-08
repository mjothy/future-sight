import React, { Component } from 'react'
import PlotlyGraph from '../../graphs/PlotlyGraph'

export default class DataBlockView extends Component {
  render() {
    return <PlotlyGraph {...this.props} />
  }
}
