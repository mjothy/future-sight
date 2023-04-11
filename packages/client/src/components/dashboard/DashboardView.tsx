import {
  BlockModel,
  ComponentPropsWithDataManager,
  Dashboard,
  DashboardModel,
  FilterObject,
} from '@future-sight/common';
import React from 'react';
import SetupView from './form/SetupView';
import { RoutingProps } from '../app/Routing';

interface DashboardViewProps extends ComponentPropsWithDataManager, RoutingProps {
  dashboard: DashboardModel;
  addBlock: (blockType: string, masterBlockId?: string) => void;
  blockSelectedId: string;
  updateSelectedBlock: (blockSelectedId: string) => void;
  saveDashboard: (callback: (idPermanent) => void, image?: string) => void;
  deleteBlocks: (bockId: string[]) => void;
  isDraft: boolean;
  readonly?: boolean;
  updateDashboard: (dashboard: DashboardModel) => void;
  checkIfSelectedInOptions: (optionsData, block: BlockModel) => void;
  filters: FilterObject,
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
          filters={this.props.filters}
          updateDashboard={this.props.updateDashboard}
          allData={this.props.allData}
        />
      </>
    );
  }
}

export default DashboardView;
