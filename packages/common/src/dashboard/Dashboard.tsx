import React, { Component } from 'react'
import DashboardConfigView from './DashboardConfigView';
import DashboardConfigControl from './DashboardConfigControl';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import Sidebar from './sidebar/Sidebar';

export default class Dashboard extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      sidebarVisible: false,
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0)
  }

  render() {
    const setVisibility = () => {
      this.setState({
        sidebarVisible: !this.state.sidebarVisible
      })
    }

    return (

      <div className='dashboard'>
        <Sidebar visible={this.state.sidebarVisible} {...this.props} >
          <DashboardConfigControl {...this.props} />
        </Sidebar>
        <div className="dashboard-content">
          <div>
            {React.createElement(this.state.sidebarVisible ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setVisibility(),
            })}
          </div>
          <DashboardConfigView {...this.props} />
        </div>
      </div>
    )
  }
}