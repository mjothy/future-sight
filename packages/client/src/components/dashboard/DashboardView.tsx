import {
  BlockModel,
  ComponentPropsWithDataManager,
  Dashboard,
  DashboardModel,
  LayoutModel,
} from '@future-sight/common';
import React from 'react';
import SetupView from './form/SetupView';
import { RoutingProps } from '../app/Routing';

interface DashboardViewProps extends ComponentPropsWithDataManager, RoutingProps {
  dashboard: DashboardModel;
  addBlock: (blockType: string, masterBlockId?: string) => void;
  blockSelectedId: string;
  updateLayout: (layout: LayoutModel[]) => void;
  updateSelectedBlock: (blockSelectedId: string) => void;
  updateBlockMetaData: (data: any, blockId: any) => void;
  updateBlockStyleConfig: (data: any) => void;
  saveDashboard: (callback: (idPermanent) => void, image?: string) => void;
  updateDashboardMetadata: (data: any, deletion?: any) => void;
  deleteBlocks: (bockId: string[]) => void;
  isDraft: boolean;
  readonly?: boolean;
}

/**
 * Render dashboard and set up view (focus data filter)
 */
class DashboardView extends React.Component<DashboardViewProps, any> {
  render() {
    return (
      <>
        <Dashboard {...this.props} />
        <SetupView {...this.props} />
      </>
    );
  }
}

export default DashboardView;
