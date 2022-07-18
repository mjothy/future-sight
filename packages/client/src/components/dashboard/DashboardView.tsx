import { Dashboard, DashboardNavbar } from '@future-sight/common'
import React from 'react'
import ViewSetup from './form/SetupView';
/**
 * This is parent of:
 * -- ViewSetup (in client)
 * -- Dashboard (in common)
 * 
 */
// If submited: the blocks page
// if not: ViewSetup
export default class DashboardView extends React.Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      isSubmited: false,
      author: "",
      title: "",
      tags: [],
      models: [],
      scenarios: []
    }
  }

  handleSubmit = () => {
    console.log("enter here !");
    this.setState({ isSubmited: true }, () => true);
    return true;
  }

  submitEvent = (value) => {
    this.setState({ isSubmited: value });
  }

  dashboardAddForm = () => {
    return <ViewSetup submitEvent={this.handleSubmit} />
  }

  dashboardManager = () => {
    // props: scenarios, models, userData ...
    return <Dashboard />
  }
  render() {
    return (

      <>
        <DashboardNavbar submited={this.state.isSubmited} />
        {
          this.state.isSubmited ? this.dashboardManager() : this.dashboardAddForm()
        }
      </>
    )
  }
}
