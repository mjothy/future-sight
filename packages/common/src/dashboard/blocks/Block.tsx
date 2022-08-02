import React, { Component } from 'react'
import BarGraph from '../graphs/BarGraph';
import LineGraph from '../graphs/LineGraph';

// Responsability choise the block

export default class Block extends Component<any, any> {

  constructor(props) {
    super(props);
  }

  blockByType = () => {
    const type = this.props.data.type;
    switch (type) {
      case "bar":
        return <BarGraph {...this.props} />
      case "line":
        return <LineGraph {...this.props} />
    }
  }
  render() {
    return (this.blockByType())
  }
}
