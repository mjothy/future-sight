import { Component } from 'react';
import DashboardControl from './sidebar/DashboardControl';
import BlockEditor from './sidebar/BlockEditor';
import PropTypes from 'prop-types';
import { DashboardProps } from './Dashboard';

/**
 * Show {Edit selected block} OR {Add new block}
 */
export default class DashboardConfigControl extends Component<
  DashboardProps,
  any
> {
  static propTypes = {
    blockSelectedId: PropTypes.string,
  };

  render() {
    return this.props.blockSelectedId ? (
      <BlockEditor {...this.props} />
    ) : (
      <DashboardControl {...this.props} />
    );
  }
}
