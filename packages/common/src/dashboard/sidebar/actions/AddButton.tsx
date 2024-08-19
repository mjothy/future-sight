import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';

export default class AddButton extends Component<any, any> {

  clicked = () => {
    this.props.clicked();
  };

  render() {
    return (
      <Tooltip title={this.props.action.info} placement="bottom">
        <Button type={this.props.action.button} onClick={this.clicked}>
          {this.props.action.label}
        </Button>
      </Tooltip>
    );
  }
}
