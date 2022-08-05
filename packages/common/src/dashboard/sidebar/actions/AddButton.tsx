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


    clicked = () => {
      this.props.clicked()
    }  

  render() {
    return (
      <Button type='default' onClick={this.clicked.bind(this)}>{this.props.label}</Button>
    )
  }
}
