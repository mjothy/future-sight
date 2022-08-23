import { Component } from 'react'
import BlockEditorManager from '../blocks/editors/BlockEditorManager';
import PropTypes from 'prop-types';
import { DashboardProps } from '../Dashboard';

/**
 * The block editor form, call BlockEditorManager to render the editor form view correspond to the control selected type
 */
export default class BlockEditor extends Component<DashboardProps, any> {
  static propTypes = {
    updateSelectedBlock: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      tab: "data"
    }
  }


  tabsToggle = (tabType) => {
    console.log("tabType: ", tabType);
    this.setState({ tab: tabType });
  }
  render() {
    return (
      <>
        <BlockEditorManager {...this.props} tabsToggle={this.tabsToggle} dataBlockTab={this.state.tab} />
      </>
    );
  }
}
