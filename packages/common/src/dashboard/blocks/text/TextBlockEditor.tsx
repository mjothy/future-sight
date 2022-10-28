import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

export default class TextBlockEditor extends React.Component<any,any> {
  render() {
      return (
          <MDEditor
              className={"mt-20"}
              value={this.props.currentBlock.config.value}
              onChange={(value?: string | undefined) => {
                  this.props.updateBlockMetaData(value, this.props.currentBlock.id);
              }}
              previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
              }}
              preview="edit"
          />
      );
  }
};
