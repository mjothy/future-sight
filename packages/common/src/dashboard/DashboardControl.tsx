import { Component } from 'react'
import { Button } from 'antd';
import ActionsSidebar from './sidebar/ActionsSidebar';
import SidebarManager from './sidebar/SidebarManager';

// The sidebar add block content
export default class DashboardControl extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false
    }
  }

  showActions = () => {
    this.setState({ formVisible: false })
  }
  formAddBlock = (type) => {
    this.setState({ formVisible: true, type })
  }


  render() {
    return (
      <>
        {
          this.state.formVisible
            ?
            <>
              <Button type='default' onClick={this.showActions}>X</Button>
              <SidebarManager type={this.state.type} {...this.props} />
            </>
            :
            <ActionsSidebar formAddBlock={(type) => this.formAddBlock(type)} />
        }
      </>
    )
  }
}
