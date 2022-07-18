import React, { Component } from 'react'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightCircleFilled,
  LeftCircleFilled
} from '@ant-design/icons';
import { Layout, Menu, Button, Row, Col, Divider } from 'antd';
import ActionsSidebar from './sidebar/ActionsSidebar';
import SidebarManager from './sidebar/SidebarManager';

// The sidebar add block content
export default class DashboardControl extends Component<any,any> {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false
    }
  }
  
  showActions = () => {
    this.setState({ formVisible: false })
  }
  formAddBlock = (type) => {
    this.setState({ formVisible: true, type })
  }


  render() {
    return (
      <>
      {
        this.state.formVisible
          ?
          <>
          <Button type='default' onClick={this.showActions}>X</Button>
          <SidebarManager type={this.state.type} position={this.state.position} />
          </>
          :
          <ActionsSidebar formAddBlock={(type) => this.formAddBlock(type)} />
      }
      </>
    )
  }
}
