import React, { Component } from 'react';
import DashboardConfigView from './DashboardConfigView';
import DashboardConfigControl from './DashboardConfigControl';
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
  updateBlockMetaData: (data: any, blockId: any) => void;
  updateBlockStyleConfig: (data: any) => void;
  saveDashboard: (callback: (idPermanent) => void, image?: string) => void;
  isEmbedded?: boolean;
}

export default class Dashboard extends Component<DashboardProps, any> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div
        className="dashboard"
        style={{ height: this.props.isEmbedded ? '100%' : undefined }}
      >
        <Sidebar
          onClose={() => this.props.updateSelectedBlock('')}
          onCloseMenu={() => this.props.updateSelectedBlock('')}
          {...this.props}
        >
          <DashboardConfigControl {...this.props} />
        </Sidebar>
        <div className="dashboard-content">
          <DashboardConfigView {...this.props} />
        </div>
      </div>
    );
  }
}
