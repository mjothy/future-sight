import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeftOutlined,
  CloseOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PicLeftOutlined,
  PicRightOutlined,
} from '@ant-design/icons';
import { Button, Space, Tooltip, Layout } from 'antd';
import DashboardGlobalInfo from './DashboardGlobalInfo';
const { Sider } = Layout;

export default class Sidebar extends Component<any, any> {
  static propTypes = {
    submitSetupView: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      placement: 'right',
      isShowGlobalInfo: false
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
    this.setState({ visible: !this.state.visible });
  }

  setPlacement = (placement) => {
    this.setState({ placement: placement });
  }

  getTitle = () => {
    if (this.props.blockSelectedId !== '') {
      return (
        <Space className={"ant-drawer-title"}>
          <Tooltip title="Back to block creation" placement={"left"}>
            <Button icon={<ArrowLeftOutlined />} onClick={this.props.onClose} />
          </Tooltip>
          <strong>Editing selected block...</strong>
        </Space>
      )
    } else {
      return (<Space className={"ant-drawer-title"}>
        <strong>{this.props.dashboard.userData.title}</strong>
        <em>- by {this.props.dashboard.userData.author}</em>

        {<Tooltip title="Edit dashboard global information (title, author, tags)">
          <Button
            type="default"
            onClick={this.openGlobalInfoModal}
            icon={<EditOutlined />}
          />
        </Tooltip>
        }
      </Space>)
    }
  }

  openGlobalInfoModal = () => {
    this.setState({ isShowGlobalInfo: true })
  }

  closeGlobalInfoModal = () => {
    this.setState({ isShowGlobalInfo: false })
  }

  getExtra = () => {
    const opposite = this.state.placement === "right" ? "left" : "right";
    let placement;
    if (this.state.placement === "right") {
      placement = <Button onClick={() => this.setPlacement(opposite)} icon={<PicLeftOutlined />} />
    } else {
      placement = <Button onClick={() => this.setPlacement(opposite)} icon={<PicRightOutlined />} />

    }
    return (
      <Space>
        <Tooltip title={"Move menu to " + opposite} placement={"left"}>
          {placement}
        </Tooltip>
        <Tooltip title="Close menu" placement={"left"}>
          <Button
            onClick={() => {
              this.toggleVisible();
              !!this.props.onCloseMenu && this.props.onCloseMenu();
            }}
            icon={<CloseOutlined />}
          />
        </Tooltip>
      </Space>
    )
  }

  render() {
    return ([
      <Sider
        key={"dashboard-sider"}
        collapsible
        collapsed={!this.state.visible}
        collapsedWidth="0"
        trigger={null}
        className={"dashboard-sider"}
        width={"30%"}
        theme={"light"}
      >
        <div className={"sider-header"}>
          {this.getTitle()}
        </div>
        <div className={"sider-body"}>
          {this.props.children}
        </div>
      </Sider>,
      <Button
        key={"open-sider"}
        className={'sidebar-toggle'}
        icon={this.state.visible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined style={{ color: "888888" }} />}
        onClick={() => {
          this.toggleVisible();
          this.props.onCloseMenu();
        }}
      />,
      <DashboardGlobalInfo key={"Dashboard-global-info"} openGlobalInfoModal={this.openGlobalInfoModal} closeGlobalInfoModal={this.closeGlobalInfoModal} isShowGlobalInfo={this.state.isShowGlobalInfo}  {...this.props} />
    ]

    )
  }
}
