import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

const TextBlockEditor: React.FC<any> = (props) => {
  return (
    <MDEditor
      value={props.currentBlock.config.value}
      onChange={(value?: string | undefined) => {
        props.updateBlockMetaData(value, props.currentBlock['id']);
      }}
      previewOptions={{
        rehypePlugins: [[rehypeSanitize]],
      }}
      preview="edit"
    />
  );
};

export default TextBlockEditor;
