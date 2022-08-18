import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  LeftCircleFilled,
  MenuUnfoldOutlined,
  PicLeftOutlined,
  PicRightOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Space } from 'antd';
export default class Sidebar extends Component<any, any> {
  static propTypes = {
    visible: PropTypes.bool,
    submitSetupView: PropTypes.func,
    setVisibility: PropTypes.func,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Drawer
        placement={this.props.placement}
        width={500}
        visible={this.props.sidebarVisible}
        onClose={this.props.setVisibility}
        closeIcon={<MenuUnfoldOutlined />}
        maskClosable={true}
        mask={true}
        className={'drawer'}
        style={
          !this.props.sidebarVisible ? { zIndex: '-1' } : { zIndex: '999' }
        }
        extra={
          <Space>
            <LeftCircleFilled
              onClick={() => this.props.submitSetupView(false)}
            />
            <Button onClick={this.props.setPlacement} value="left">
              <PicLeftOutlined />
            </Button>
            <Button onClick={this.props.setPlacement} value="right">
              <PicRightOutlined />
            </Button>
          </Space>
        }
      >
        {this.props.children}
      </Drawer>
    );
  }
}
