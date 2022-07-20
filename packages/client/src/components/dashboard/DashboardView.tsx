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
class DashboardView extends React.Component<any, any> {
  data = {};
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
    // props: scenarios, models, userData ... (gettong selected data from ViewSetup)
    return <Dashboard />
  }
  render() {
    return (

      <div className='height-100'>
        <div className='height-10'>
                  <DashboardNavbar submited={this.state.isSubmited} />
        </div>
        {
          this.state.isSubmited ? this.dashboardManager() : this.dashboardAddForm()
        }
      </div>
    )
  }
}

export default DashboardView