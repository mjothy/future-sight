import React from 'react';
import { Input } from 'antd';

export default class JsonBlockEditor extends React.Component<any, any> {
    render() {
        return (
            <React.Fragment>
                <h3>From Python Plotly, export your figure in JSON with write_json, then paste your JSON here</h3>
                <Input.TextArea rows={10} value={JSON.stringify(this.props.currentBlock.config.json)}
                                onChange={(value) => {
                                    let json
                                    try {
                                        json = JSON.parse(value.currentTarget.value)
                                    } catch (e: any) {
                                        json = {"error" : "Invalid json"}
                                    }

                                    const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
                                    const config = dashboard.blocks[this.props.currentBlock.id].config;
                                    dashboard.blocks[this.props.currentBlock.id].config.json = json ;
                                    this.props.updateDashboard(dashboard)
                                }}/>
            </React.Fragment>
        );
    }
}
