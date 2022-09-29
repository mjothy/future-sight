import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeftOutlined,
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PicLeftOutlined,
  PicRightOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Space, Tooltip } from 'antd';

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

  toggleVisible = () => {
    this.setState({visible: !this.state.visible});
  }

  setPlacement = (placement) => {
    this.setState({placement: placement});
  }

  getTitle = () => {
    if (this.props.blockSelectedId !== '') {
      return (
          <Space>
            <Tooltip title="Back to block creation" placement={"left"}>
              <Button icon={<ArrowLeftOutlined />} onClick={this.props.onClose}/>
            </Tooltip>
            <strong>Editing selected block...</strong>
          </Space>
      )
    } else {
      return (<Space>
        <strong>{this.props.dashboard.userData.title}</strong>
        <em>- by {this.props.dashboard.userData.author}</em>
      </Space>)
    }
  }

  getExtra = () => {
    let opposite = this.state.placement === "right" ? "left" : "right";
    let placement;
    if (this.state.placement === "right") {
      placement = <Button onClick={() => this.setPlacement(opposite)} icon={<PicLeftOutlined />}/>
    } else {
      placement = <Button onClick={() => this.setPlacement(opposite)} icon={<PicRightOutlined />}/>

    }
    return (
      <Space>
        <Tooltip title={"Move menu to " + opposite}  placement={"left"}>
          {placement}
        </Tooltip>
        <Tooltip title="Close menu" placement={"left"}>
          <Button onClick={this.toggleVisible} icon={<CloseOutlined />}/>
        </Tooltip>
      </Space>
    )
  }

  render() {
    return (
      <div>
        <Button
            className={'sidebar-toggle'}
            icon={this.state.visible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined style={{color: "888888"}}/>}
            onClick={this.toggleVisible}
        />
        <Drawer
            placement={this.state.placement}
            width={500}
            visible={this.state.visible}
            closable={false}
            mask={false}
            className={'drawer'}
            title={
              this.getTitle()
            }
            extra={
              this.getExtra()
            }
        >
          {this.props.children}
        </Drawer>
      </div>
    );
  }
}
