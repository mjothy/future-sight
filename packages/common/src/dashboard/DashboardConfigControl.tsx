import { Component } from 'react'
import DashboardControl from './sidebar/DashboardControl';
import BlockEditor from './sidebar/BlockEditor';
import PropTypes from 'prop-types';

/**
 * Show {Edit selected block} OR {Add new block}
 */
export default class DashboardConfigControl extends Component<any, any> {

  static propTypes = {
    blockSelectedId: PropTypes.string
  }

  render() {
    return (
      this.props.blockSelectedId ? <BlockEditor {...this.props} /> : <DashboardControl  {...this.props} />
    )
  }

}
