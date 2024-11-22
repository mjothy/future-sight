import React from 'react';
import { Input, Alert } from 'antd';

export default class JsonBlockEditor extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            error : undefined,
            value : JSON.stringify(this.props.currentBlock.config.json)
        }
    }

    render() {
        const instance = this;
        return (
            <React.Fragment>
                <h3>From Python Plotly, export your figure in JSON with write_json, then paste your JSON here</h3>
                <Input.TextArea rows={10} value={this.state.value}
                                onChange={(value) => {
                                    let json;
                                    let error;
                                    try {
                                        json = JSON.parse(value.currentTarget.value)
                                        const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
                                        const config = dashboard.blocks[this.props.currentBlock.id].config;
                                        dashboard.blocks[this.props.currentBlock.id].config.json = json ;
                                        this.props.updateDashboard(dashboard);
                                        error = undefined;
                                    } catch (e: any) {
                                        error = "Invalid json";
                                    }
                                    this.setState({value: value.currentTarget.value, error: error})
                                }}/>
                { instance.state.error ? <Alert message={instance.state.error} type="error" /> : undefined}
            </React.Fragment>
        );
    }
}
