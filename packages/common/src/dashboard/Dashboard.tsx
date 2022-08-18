import React, { Component } from 'react';
import DashboardConfigView from './DashboardConfigView';
import DashboardConfigControl from './DashboardConfigControl';
import { MenuFoldOutlined } from '@ant-design/icons';
import Sidebar from './sidebar/Sidebar';

export default class Dashboard extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      sidebarVisible: false,
      placement: 'right',
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps, prevState, snaphshot) {
    if (this.props.blockSelectedId != prevProps.blockSelectedId) {
      this.setState({
        sidebarVisible: true,
      });
    }
  }

  render() {
    const setVisibility = () => {
      this.setState({
        sidebarVisible: !this.state.sidebarVisible,
      });
    };

    const setPlacement = (e) => {
      this.setState({ placement: e.currentTarget.value });
    };

    return (
      <div className="dashboard">
        <Sidebar
          sidebarVisible={this.state.sidebarVisible}
          placement={this.state.placement}
          setVisibility={setVisibility}
          setPlacement={setPlacement}
          {...this.props}
        >
          <DashboardConfigControl {...this.props} />
        </Sidebar>
        <div className="dashboard-content">
          <div>
            {!this.state.sidebarVisible &&
              React.createElement(MenuFoldOutlined, {
                className: 'sidebar-' + this.state.placement,
                onClick: () => setVisibility(),
              })}
          </div>
          <DashboardConfigView {...this.props} />
        </div>
      </div>
    );
  }
}
