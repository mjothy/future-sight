import {
  DashboardDataConfiguration,
  ComponentPropsWithDataManager,
} from '@future-sight/common';
import React from 'react';
import withDataManager from '../../services/withDataManager';
import SetupView from './form/SetupView';

/**
 * For adding or update a dashboard.
 * It manage set up view and ashboard view for adding/updating a dashboard
 */
class DashboardView extends React.Component<
  ComponentPropsWithDataManager,
  any
> {
  data = {}; // TODO: remove ?
  constructor(props) {
    super(props);
    this.state = {
      isSubmited: false,
      userData: {
        title: '',
        author: '',
        tags: [],
      },
      /**
       * Selected data to work with in dashboard {model: {scenario: { variables: [], regions: []}}}
       */
      data: [],
    };
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
    const userData = { ...this.state.userData };

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
    this.setState({ userData: { ...userData } });
  };

  handleStructureData = (data) => {
    this.setState({ data });
  };

  dashboardAddForm = () => {
    return (
      <SetupView
        {...this.props}
        userData={this.state.userData}
        structureData={this.state.data}
        submitEvent={this.handleSubmit}
        updateUserData={this.handleUserData}
        handleStructureData={this.handleStructureData}
      />
    );
  };

  dashboardManager = () => {
    return (
      <DashboardDataConfiguration
        {...this.props}
        userData={this.state.userData}
        structureData={this.state.data}
        submitSetupView={this.handleSubmit}
      />
    );
  };
  render() {
    return (
      <div className="height-100">
        {this.state.isSubmited
          ? this.dashboardManager()
          : this.dashboardAddForm()}
      </div>
    );
  }
}

export default withDataManager(DashboardView);
