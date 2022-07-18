import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Button } from 'antd';

export default class AddButton extends Component<any,any> {
    static propTypes = {
        label: PropTypes.string,
        type: PropTypes.string
    };

    static defaultProps = {
        label: "Add",
        type: "text"
    };

    constructor(props) {
        super(props);
        this.state = {
            formVisible: false
        };
    }


    addBlock = () => {
      this.props.addBlock()
    }  

  render() {
    return (
      <Button type='default' onClick={this.addBlock}>{this.props.label}</Button>
    )
  }
}
