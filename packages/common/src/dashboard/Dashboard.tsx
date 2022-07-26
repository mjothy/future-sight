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

  sidebarRef;

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      placement:'right',
      isResizing: false,
      sidebarWidth: (window.innerWidth) * 0.3,
      contentWidth: window.innerWidth - (window.innerWidth) * 0.3
    }
    this.sidebarRef = React.createRef();

    console.log("Dashboard: ", this.props);
  }
  startResizing = () => {
    this.setState({ isResizing: true });
  };
  stopResizing = () => {
    this.setState({ isResizing: false });
  };

  resize = (mouseMoveEvent) => {
    if (this.state.isResizing) {
      const sidebarWidth = mouseMoveEvent.clientX -
        this.sidebarRef.current.getBoundingClientRect().left;
      const contentWidth = window.innerWidth - sidebarWidth;
      this.setState({
        sidebarWidth, contentWidth
      }, () => {
        window.dispatchEvent(new Event('resize'));
      })
    }
  }

  componentDidMount() {
    window.addEventListener("mousemove", this.resize);
    window.addEventListener("mouseup", this.stopResizing);
    window.scrollTo(0, 0)

  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.resize);
    window.removeEventListener("mouseup", this.stopResizing);
  }

  render() {
    const setCollapsed = () => {
      const state = {
        sidebarWidth: (window.innerWidth) * 0.3,
        contentWidth: window.innerWidth - (window.innerWidth) * 0.3,
        collapsed: !this.state.collapsed
      }
      if (state.collapsed) state.contentWidth = window.innerWidth
      else state.contentWidth = window.innerWidth - state.sidebarWidth

      this.setState(state, () => {
        window.dispatchEvent(new Event('resize'));
      })
    }

    const setVisibility = () => {
      this.setState({        collapsed: !this.state.collapsed
      })
    }

    const setPlacement = (e) =>{
      console.log("target: ",e.target)
      this.setState({placement: e.target.value})
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
            extra={
              <Space>
                <Button onClick={setPlacement} value="left">left</Button>
                <Button type="primary" onClick={setPlacement} value="right">
                  right
                </Button>
              </Space>
            }
          >
            <DashboardConfigControl data={this.props} />
          </Drawer>
        </div>
        <div className="dashboard-content" style={{width: "100%"}}>
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
