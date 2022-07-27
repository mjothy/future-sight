import { Dashboard } from '@future-sight/common'
import React from 'react'
import SetupView from './form/SetupView';

/**
 * For adding or update a dashboard.
 * It manage set up view and ashboard view for adding/updating a dashboard
 */
class DashboardView extends React.Component<any, any> {
  data = {};
  constructor(props) {
    super(props);
    this.state = {
      isSubmited: false,
      userData: {
        title: '',
        author: '',
        tags: []
      },
      /**
       * Selected models to work with in dashboard
       */
      models: [],
      scenarios: [],
      variables: []
    }
  }

  /**
   * Decide on wich view the user working, SetUpView (To add the metadata of the current dashboard)
   * OR Dashbard to add and edit the dashboard blocks
   * @param data  True if the user sumbit the metaData, OR False to back for updating the metaData
   */
  handleSubmit = (data: boolean) => {
    this.setState({ isSubmited: data });
  }

  /**
   * Geting and update the value the user data
   * @param data contains the information of the dashboard {title, author and tags}
   */
  handleUserData = (data) => {
    const userData = { ...this.state.userData }

    switch (data.name) {
      case 'title': userData.title = data.value; break;
      case 'author': userData.author = data.value; break;
      case 'tags': userData.tags = data.value; break;
    }
    this.setState({ userData: { ...userData } });
  }

  handleStructureData = (models, variables) => {
    this.setState({models, variables});
  }

  dashboardAddForm = () => {
    return <SetupView userData={this.state.userData} submitEvent={this.handleSubmit} updateUserData={this.handleUserData}
    handleStructureData = {this.handleStructureData} models = {this.state.models} />
  }

  dashboardManager = () => {
    // props: scenarios, models, userData ... (gettong selected data from SetupView)
    return <Dashboard userData={this.state.userData} structureData = {{models: this.state.models, variables: this.state.variables}} submitEvent={this.handleSubmit} />
  }
  render() {
    return (

      <div className='height-100'>
        {
          this.state.isSubmited ? this.dashboardManager() : this.dashboardAddForm()
        }
      </div>
    )
  }
}

export default DashboardView
