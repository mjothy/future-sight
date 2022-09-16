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
import { Radio } from 'antd';

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
  saveDashboard: (callback: (idPermanent) => void, image?: string) => void;
  updateDashboardMetadata: (data: any, deletion?: any) => void;
  deleteBlock: (bockId: string) => void;
  isDraft: boolean;
  readonly?: boolean;
  updateSelectedFilter:(filter:string)=>void;
  selectedFilter:string;
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
      setupDashboardMode: 'dashboard'
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

  setupView = () => {
    return (
      <SetupView
        {...this.props}
        userData={this.props.dashboard.userData}
        submitEvent={this.switchSetupDashboardMode}
        updateUserData={this.handleUserData}
        handleStructureData={this.handleStructureData}
        visible={this.state.setupDashboardMode === 'setup'}
      />
    );
  };

  dashboardManager = () => {
    return <Dashboard {...this.props} />;
  };

  switchSetupDashboardMode = (view) => {
    console.log("called: ", view);
    this.setState({ setupDashboardMode: view })
  }

  render() {
    return (
      <>
        <div className="back-to-setup">
          <Radio.Group
            value={this.state.setupDashboardMode}
            onChange={(e) => this.switchSetupDashboardMode(e.target.value)}
            buttonStyle="solid">
            <Radio.Button value="setup">Filter data</Radio.Button>
            <Radio.Button value="dashboard">Dashboard</Radio.Button>
          </Radio.Group>
        </div>
        <Dashboard {...this.props} />
        <SetupView
        {...this.props}
        userData={this.props.dashboard.userData}
        submitEvent={this.switchSetupDashboardMode}
        updateUserData={this.handleUserData}
        handleStructureData={this.handleStructureData}
        visible={this.state.setupDashboardMode === 'setup'}
      />
      </>
    );
  }
}

export default DashboardView;
