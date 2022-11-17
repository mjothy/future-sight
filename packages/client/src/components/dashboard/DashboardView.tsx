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

interface DashboardViewProps
  extends ComponentPropsWithDataManager,
  RoutingProps {
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
  updateDashboardMetadata: (data: any, deletion?: any) => void;
  deleteBlock: (bockId: string) => void;
  isDraft: boolean;
  readonly?: boolean;
  updateSelectedFilter: (filter: string) => void;
  selectedFilter: string;
}

/**
 * For adding or update a dashboard.
 * It manage set up view and ashboard view for adding/updating a dashboard
 */
class DashboardView extends React.Component<DashboardViewProps, any> {
  data = {}; // TODO: remove ?
  constructor(props) {
    super(props);
    this.state = {
      isSubmited: false,
      /**
       * Selected data to work with in dashboard {model: {scenario: { variables: [], regions: []}}}
       */
      data: []
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Check if the dashboard exist or it's new
    if (prevProps.isDraft !== this.props.isDraft && this.props.isDraft) {
      this.setState({ isSubmited: true });
    }
  }

  render() {
    return (
      <>
        <Dashboard {...this.props} />
        <SetupView
          {...this.props}
          userData={this.props.dashboard.userData}
        />
      </>
    );
  }
}

export default DashboardView;
