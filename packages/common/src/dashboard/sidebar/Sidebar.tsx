import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PicLeftOutlined,
  PicRightOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Space } from 'antd';

export default class Sidebar extends Component<any, any> {
  static propTypes = {
    submitSetupView: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      placement: 'right',
    };
  }

  componentDidUpdate(prevProps, prevState, snaphshot) {
    if (this.props.blockSelectedId != prevProps.blockSelectedId &&
        this.props.blockSelectedId !== '') {
      this.setState({
        visible: true,
      });
    }
  }

  backToSetup = () => {
    this.props.submitSetupView(false);
    this.props.updateSelectedBlock('');
  };

  toggleVisible = () => {
    this.setState({visible: !this.state.visible});
  }

  setPlacement = (placement) => {
    this.setState({placement: placement});
  }

  render() {
    return (
      <div>
        <Button
            className={'sidebar-toggle'}
            icon={this.state.visible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={this.toggleVisible}
        />
        <Drawer
            placement={this.state.placement}
            width={500}
            visible={this.state.visible}
            onClose={this.toggleVisible}
            maskClosable={true}
            mask={false}
            className={'drawer'}
            title={
              <Space>
                <strong>{this.props.dashboard.userData.title}</strong>
                <em>- by {this.props.dashboard.userData.author}</em>
              </Space>
            }
            extra={
              <Space>
                <Button onClick={() => this.setPlacement("left")} icon={<PicLeftOutlined />}/>
                <Button onClick={() => this.setPlacement("right")} icon={<PicRightOutlined />}/>
              </Space>
            }
        >
          {this.props.children}
        </Drawer>
      </div>
    );
  }
}
