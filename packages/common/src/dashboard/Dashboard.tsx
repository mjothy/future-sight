import React, { Component } from 'react'
import DashboardConfigView from './DashboardConfigView';
import DashboardConfigControl from './DashboardConfigControl';
import initialState from './initialState';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import layoutConfig from './layoutConfig';
import { Button, Drawer, Space } from 'antd';

export default class Dashboard extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      placement: 'left',
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0)
  }

  render() {
    const setVisibility = () => {
      this.setState({
        collapsed: !this.state.collapsed
      })
    }

    const setPlacement = (e) => {
      this.setState({ placement: e.currentTarget.value })
    }

    return (
      <div className='dashboard'>
        <div>
          <Drawer
            placement={this.state.placement}
            width={500}
            visible={this.state.collapsed}
            onClose={setVisibility}
            maskClosable={false}
            mask={false}
            className={"drawer"}
            style={!this.state.collapsed ? {zIndex:'-1'}: {zIndex:'0'}}
            extra={
              <Space>
                <Button onClick={setPlacement} value="left">left</Button>
                <Button onClick={setPlacement} value="right">right</Button>
              </Space>
            }
          >
            <DashboardConfigControl data={this.props} />
          </Drawer>
        </div>
        <div className="dashboard-content">
          <div>
            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setVisibility(),
            })}
          </div>
          <DashboardConfigView data={initialState.data} layouts={layoutConfig} />
        </div>
      </div>
    )
  }
}