import { Component } from 'react';
import DashboardControl from './sidebar/DashboardControl';
import PropTypes from 'prop-types';
import { DashboardProps } from './Dashboard';
import BlockEditorManager from './blocks/BlockEditorManager';

export interface DashboardConfigControlProps extends DashboardProps {
  publishing: boolean
  onPublish: (username: string, password: string) => void,
  checkUser: (username: string, password: string) => Promise<boolean>
}

/**
 * Show {Edit selected block} OR {Add new block}
 */
export default class DashboardConfigControl extends Component<
  DashboardConfigControlProps,
  any
> {
  static propTypes = {
    blockSelectedId: PropTypes.string,
  };

  render() {
    return this.props.blockSelectedId ? (
      <BlockEditorManager {...this.props} currentBlock={this.props.dashboard.blocks[this.props.blockSelectedId]} />
    ) : (
      <DashboardControl {...this.props} />
    );
  }
}
