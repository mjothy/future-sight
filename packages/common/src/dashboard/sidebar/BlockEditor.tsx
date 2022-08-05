import { Component } from 'react'
import { Button } from 'antd';
import BlockEditorManager from '../blocks/editors/BlockEditorManager';

/**
 * The block editor form
 */
export default class BlockEditor extends Component<any, any> {

  render() {
    return (
      <>
        <Button type='default' onClick={this.props.unselectBlock}>X</Button>
        <BlockEditorManager {...this.props} />
      </>
    )
  }

}
