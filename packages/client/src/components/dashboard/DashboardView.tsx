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
  saveDashboard: (callback: () => void) => void;
  updateDashboardMetadata: (data: any) => void;
  deleteBlock: (bockId: string) => void;
  isDraft: boolean;
  readonly?: boolean;
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
   * Decide on wich view the user working, SetUpView (To add the metadata of the current dashboard)
   * OR Dashbard to add and edit the dashboard blocks
   * @param data  True if the user sumbit the metaData, OR False to back for updating the metaData
   */
  handleSubmit = (data: boolean) => {
    this.setState({ isSubmited: data });
  };

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

  handleStructureData = (data) => {
    // this.setState({ data });
    this.props.updateDashboardMetadata({ dataStructure: data });
  };

  dashboardAddForm = () => {
    return (
      <div className="content-wrapper">
        <SetupView
          {...this.props}
          userData={this.props.dashboard.userData}
          structureData={this.props.dashboard.dataStructure}
          submitEvent={this.handleSubmit}
          updateUserData={this.handleUserData}
          handleStructureData={this.handleStructureData}
        />
      </div>
    );
  };

  dashboardManager = () => {
    return <Dashboard {...this.props} submitSetupView={this.handleSubmit} />;
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
