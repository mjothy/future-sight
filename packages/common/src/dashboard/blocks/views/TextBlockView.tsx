import React from 'react';
import MDEditor from '@uiw/react-md-editor';

interface TextBlockViewProps {
  currentBlock: any;
}

const TextBlockView: React.FC<TextBlockViewProps> = ({ currentBlock }) => {
  return <MDEditor.Markdown source={currentBlock.config.value} />;
};

export default TextBlockView;
