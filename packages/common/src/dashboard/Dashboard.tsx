import React, { Component } from 'react';
import DashboardConfigView from './DashboardConfigView';
import DashboardConfigControl from './DashboardConfigControl';
import { MenuFoldOutlined } from '@ant-design/icons';
import Sidebar from './sidebar/Sidebar';
import ComponentPropsWithDataManager from '../datamanager/ComponentPropsWithDataManager';

import DashboardModel from '../models/DashboardModel';
import LayoutModel from '../models/LayoutModel';
import BlockModel from '../models/BlockModel';

export interface DashboardProps extends ComponentPropsWithDataManager {
  dashboard: DashboardModel;
  addBlock: (blockType: string, masterBlockId?: string) => void;
  blockSelectedId: string;
  layout: LayoutModel[];
  updateLayout: (layout: LayoutModel[]) => void;
  blocks: { [id: string]: BlockModel };
  updateSelectedBlock: (blockSelectedId: string) => void;
  updateBlockMetaData: (data: any) => void;
  updateBlockStyleConfig: (data: any) => void;
  saveDashboard: () => void;
  submitSetupView: (data: any) => void
}

export default class Dashboard extends Component<DashboardProps, any> {

  constructor(props) {
    super(props);
    this.state = {
      sidebarVisible: true,
      placement: 'right',
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps, prevState, snaphshot) {
    if (
      this.props.blockSelectedId != prevProps.blockSelectedId &&
      this.props.blockSelectedId !== ''
    ) {
      this.setState({
        sidebarVisible: true,
      });
    }
  }

  render() {
    const setVisibility = () => {
      this.setState(
        {
          sidebarVisible: !this.state.sidebarVisible,
        },
        () => {
          if (this.state.sidebarVisible === false)
            this.props.updateSelectedBlock("");
        }
      );
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
