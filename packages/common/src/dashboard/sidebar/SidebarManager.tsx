import { Component } from 'react'
import PropTypes from 'prop-types';
import TextBlock from '../blocks/TextBlock';
import DataBlock from '../blocks/DataBlock';
import ControlBlock from '../blocks/ControlBlock';

// Deside which form (Block Type) will send to UI
// Input: 
export default class SidebarManager extends Component<any, any> {

  static propTypes = {
    label: PropTypes.string,
    type: PropTypes.string // formulaire or action buttons
  };

  constructor(props) {
    super(props);
  }

  // block type handler
  renderAddBlockView() {
    switch (this.props.type) {
      case "text": return <TextBlock {...this.props}/>
      case "data": return <DataBlock {...this.props}/>
      case "control": return <ControlBlock {...this.props}/>
      default: return <p>Error ! </p>
    }
  }

  render() {
    return this.renderAddBlockView()
  }
}
