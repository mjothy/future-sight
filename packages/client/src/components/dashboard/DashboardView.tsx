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
  updateBlockMetaData: (data: any) => void;
  updateBlockStyleConfig: (data: any) => void;
  saveDashboard: (callback: (idPermanent) => void) => void;
  updateDashboardMetadata: (data: any, deletion?: any) => void;
  deleteBlock: (bockId: string) => void;
  isDraft: boolean;
  readonly?: boolean;
  setupConfigMode: boolean;
  setSetupConfigMode: (setup: boolean) => void;
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
      data: [],
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Check if the dashboard exist or it's new
    if (prevProps.isDraft !== this.props.isDraft && this.props.isDraft) {
      this.setState({ isSubmited: true });
    }
  }

  /**
   * Geting and update the value the user data
   * @param data contains the information of the dashboard {title, author and tags}
   */
  handleUserData = (data) => {
    const userData = this.props.dashboard.userData;

    switch (data.name) {
      case 'title':
        userData.title = data.value;
        break;
      case 'author':
        userData.author = data.value;
        break;
      case 'tags':
        userData.tags = data.value;
        break;
    }
    this.props.updateDashboardMetadata({ userData });
  };

  handleStructureData = (data, deletion = undefined) => {
    this.props.updateDashboardMetadata({ dataStructure: data }, deletion);
  };

  dashboardAddForm = () => {
    return (
      <div className="content-wrapper">
        <SetupView
          {...this.props}
          userData={this.props.dashboard.userData}
          structureData={this.props.dashboard.dataStructure}
          submitEvent={this.props.setSetupConfigMode}
          updateUserData={this.handleUserData}
          handleStructureData={this.handleStructureData}
        />
      </div>
    );
  };

  dashboardManager = () => {
    return <Dashboard {...this.props} />;
  };
  render() {
    return (
      <>
        {this.state.isSubmited || !this.props.setupConfigMode
          ? this.dashboardManager()
          : this.dashboardAddForm()}
      </>
    );
  }
}

export default DashboardView;
