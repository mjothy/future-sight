import { Component } from 'react';
import DashboardControl from './sidebar/DashboardControl';
import PropTypes from 'prop-types';
import { DashboardProps } from './Dashboard';
import BlockEditorManager from './blocks/editors/BlockEditorManager';

/**
 * Show {Edit selected block} OR {Add new block}
 */
// export default class DashboardConfigControl extends Component<
//   DashboardProps,
//   any
// > {
  export default class DashboardConfigControl extends Component<
  any,
  any
> {
  static propTypes = {
    blockSelectedId: PropTypes.string,
  };

  render() {
    return this.props.blockSelectedId ? (
      <BlockEditorManager {...this.props} />
    ) : (
      <DashboardControl {...this.props} />
    );
  }
}
