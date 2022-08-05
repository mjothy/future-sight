import { Component } from 'react'
import DashboardControl from './sidebar/DashboardControl';
import BlockEditor from './sidebar/BlockEditor';


// Show {Edit selected block} OR {Add new block}
export default class DashboardConfigControl extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      click: 0,
    }
  }

  render() {
    return (
      <>
        {
          this.props.blockSelectedId
            ?
            <BlockEditor type={this.state.type} {...this.props} />
            :
            <DashboardControl  {...this.props}/>
        }
      </>
    )
  }
}
