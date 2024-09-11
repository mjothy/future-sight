import {
  BlockModel,
  ComponentPropsWithDataManager,
  Dashboard,
  DashboardModel,
} from '@future-sight/common';
import React from 'react';
import SetupView from './form/SetupView';
import { RoutingProps } from '../app/Routing';

interface DashboardViewProps extends ComponentPropsWithDataManager, RoutingProps {
  dashboard: DashboardModel;
  addBlock: (blockType: string, masterBlockId?: string) => void;
  copyBlock: (blockSelectedId: string) => void;
  blockSelectedId: string;
  updateSelectedBlock: (blockSelectedId: string) => void;
  saveDashboard: (username: string, password: string, callback: (idPermanent) => void, image?: string) => void;
  deleteBlocks: (blockId: string[]) => void;
  isDraft: boolean;
  readonly?: boolean;
  updateDashboard: (dashboard: DashboardModel) => void;
  allData: any,
}

/**
 * Render dashboard and set up view (focus data filter)
 */
class DashboardView extends React.Component<DashboardViewProps, any> {
  render() {
    return (
      <>
        <Dashboard {...this.props} />
        <SetupView
          dashboard={this.props.dashboard}
          updateDashboard={this.props.updateDashboard}
          allData={this.props.allData}
        />
      </>
    );
  }
}

export default DashboardView;
