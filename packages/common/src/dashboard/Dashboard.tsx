import React, { Component } from 'react'
import DashboardConfigView from './DashboardConfigView';
import SideBar from './sidebar/SideBar';
import DashboardManager from './DashboardManager';
import DashboardConfigControl from './DashboardConfigControl';
import initialState from './initialState';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import layoutConfig from './layoutConfig';

//To visualize all the dashboard (blocks layout, header navbar, and the sidebar that move)
//make 4 choises of sidebar (up, down, left, right)
//this is independent module so we can import it, make the architecture, and save the dashboard config on database

// 2 types (published or uppublished dashboard )



export default class Dashboard extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot)
{
  if(prevState.collapsed !== this.state.collapsed)
  this.render();
}

  render() {
    const setCollapsed = () => {
      console.log("collapse")
      this.setState({ collapsed: !this.state.collapsed })
    }
    return (
      <DashboardManager>
        <div className='sidebar-context'>
          <div className={!this.state.collapsed ? "sidebar" : "sidebar hide-sidebar"}>
            <DashboardConfigControl />
          </div>
          <div className="content-sidebar">
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
