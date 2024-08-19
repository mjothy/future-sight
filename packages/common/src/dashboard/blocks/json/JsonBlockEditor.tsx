import React from 'react';
import { Input } from 'antd';

export default class JsonBlockEditor extends React.Component<any, any> {
    render() {
        return (
            <Input.TextArea rows={10} value={this.props.currentBlock.config.json}
                            onChange={(value) => {
                                let json = JSON.parse(value.currentTarget.value)

                                const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
                                const config = dashboard.blocks[this.props.currentBlock.id].config;
                                dashboard.blocks[this.props.currentBlock.id].config.json = json ;
                                this.props.updateDashboard(dashboard)
                            }}/>
        );
    }
}
