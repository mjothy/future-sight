import { Component } from 'react'
import { Button } from 'antd';
import BlockEditorManager from '../blocks/editors/BlockEditorManager';
import PropTypes from 'prop-types';

/**
 * The block editor form, call BlockEditorManager to render the editor form view correspond to the control selected type
 */
export default class BlockEditor extends Component<any, any> {
  
  static propTypes = {
    unselectBlock: PropTypes.func
  }

  render() {
    return (
      <>
        <Button type='default' onClick={this.props.unselectBlock}>X</Button>
        <BlockEditorManager {...this.props} />
      </>
    )
  }

}
