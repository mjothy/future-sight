import React, { Component } from 'react'
import DashboardConfigView from './DashboardConfigView';
import DashboardManager from './DashboardManager';
import DashboardConfigControl from './DashboardConfigControl';
import initialState from './initialState';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import layoutConfig from './layoutConfig';

export default class Dashboard extends Component<any, any> {

  sidebarRef;

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
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
    console.log("componentDidMount")
    window.addEventListener("mousemove", this.resize);
    window.addEventListener("mouseup", this.stopResizing);
  }

  componentWillUnmount(){
   console.log("componentWillUnmount") 
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

    return (
      <DashboardManager>
        <div className='dashboard'>

          <div ref={this.sidebarRef} style={{ width: this.state.sidebarWidth }} className={!this.state.collapsed ? "sidebar" : "sidebar hide-sidebar"}>
            <DashboardConfigControl />
          </div>

          <div className={!this.state.collapsed ? "sidebar-resizer" : "sidebar-resizer hide-sidebar"} onMouseDown={this.startResizing} />

          <div className="dashboard-content" style={{ width: this.state.contentWidth }}>
            <div>
              {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger',
                onClick: () => setCollapsed(),
              })}
            </div>
            <DashboardConfigView data={initialState.data} layouts={layoutConfig} />
          </div>

        </div>
      </DashboardManager>
    )
  }
}
