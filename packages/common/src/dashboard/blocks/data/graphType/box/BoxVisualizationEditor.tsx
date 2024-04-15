import { Checkbox, Col, Row, Select } from 'antd';
import { Component } from 'react';
import PlotlyUtils from "../../../../graphs/PlotlyUtils";
import PlotDataModel from "../../../../../models/PlotDataModel";
import {ExclamationCircleOutlined} from "@ant-design/icons";

const { Option } = Select;

export default class BoxVisualizationEditor extends Component<any, any> {

    constructor(props) {
        super(props);
    }

    onShowBoxPointsCheckChange = (e) => {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
        configStyle.showBoxPoints = e.target.checked;
        this.props.updateBlockConfig({ configStyle: configStyle })
    };

    render() {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle)
        const metaData = this.props.currentBlock.config.metaData;
        return (
            <>
                <h3>Box plot</h3>
                <Row>
                    <Col span={2} className={'checkbox-col'}>
                        <Checkbox
                            onChange={this.props.onStackCheckChange}
                            checked={configStyle.stack.isStack}
                        />
                    </Col>
                    <Col span={3} className={'checkbox-col-label'}>
                        <label>Stack</label>
                    </Col>
                    <Col span={2} className={'checkbox-col'}>
                        <Checkbox
                            onChange={this.props.onGroupByCheckChange}
                            checked={configStyle.stack.isGroupBy}
                        />
                    </Col>
                    <Col span={3} className={'checkbox-col-label'}>
                        <label>Group</label>
                    </Col>
                    <Col span={9} className={'checkbox-col-label'}>
                        <Select
                            placeholder="Select"
                            value={metaData[configStyle.stack.value]?.length > 1 ? configStyle.stack.value : null}
                            onChange={this.props.onStackValueChange}
                            notFoundContent={(
                                <div>
                                    <ExclamationCircleOutlined />
                                    <p>Item not found.</p>
                                </div>
                            )}
                            allowClear
                            disabled={!configStyle.stack.isStack && !configStyle.stack.isGroupBy}
                            dropdownMatchSelectWidth={false}
                        >
                            {this.props.optionsLabel.map((value) => {
                                    if (metaData[value].length > 1) return (
                                        <Option key={value} value={value}>
                                            {value}
                                        </Option>
                                    )
                                }
                            )}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={2} className={'checkbox-col'}>
                        <Checkbox
                            onChange={this.onShowBoxPointsCheckChange}
                            checked={configStyle.showBoxPoints}
                        />
                    </Col>
                    <Col span={6} className={'checkbox-col-label'}>
                        <label>Show data points</label>
                    </Col>
                </Row>
                </>
        )
    }
}
