import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

export default class TextBlockEditor extends React.Component<any, any> {
    render() {
        return (
            <MDEditor
                className={"mt-20"}
                value={this.props.currentBlock.config.value}
                onChange={(value?: string | undefined) => {
                    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
                    const config = dashboard.blocks[this.props.currentBlock.id].config;
                    dashboard.blocks[this.props.currentBlock.id].config = { ...config, value };
                    this.props.updateDashboard(dashboard)
                }}
                previewOptions={{
                    rehypePlugins: [[rehypeSanitize]],
                }}
                preview="edit"
            />
        );
    }
}
