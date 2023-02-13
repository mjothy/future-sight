import {Col, Row, Select} from 'antd';
import {Component} from 'react';
import PlotlyUtils from "../../../graphs/PlotlyUtils";

const {Option} = Select;

export default class PieVisualizationEditor extends Component<any, any> {

    constructor(props) {
        super(props);
    }

    onDefaultYearChange = (selectedYear: string) => {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
        configStyle.XAxis.default = selectedYear;
        this.props.updateBlockConfig({ configStyle: configStyle })
    };


    render() {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle)
        const blockData = this.props.blockData(this.props.currentBlock)
        return (
            <>
                <h3>Pie</h3>
                <Row style={{marginBottom: 2}}>
                    <Col span={2}></Col>
                    <Col span={16}>
                        Slices categories:
                    </Col>
                </Row>
                <Row className="mb-10">
                    <Col span={2}></Col>
                    <Col span={16}>
                        <Select
                            className="width-100"
                            placeholder={"Select a slice category"}
                            defaultValue={configStyle.stack.value || null}
                            onChange={this.props.onStackValueChange}
                            status={configStyle.stack.value ? undefined : "error"}
                        >
                            {this.props.optionsLabel.map((value) => (
                                <Option key={value} value={value}>
                                    {value}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>

                {/*TODO choose default year to be used on the pie chart*/}
                <Row style={{marginBottom: 2}}>
                    <Col span={2}>
                    </Col>
                    <Col span={16}>
                        Choose default year:
                    </Col>
                </Row>
                <Row className="mb-10">
                    <Col span={2}/>
                    <Col span={16}>
                        <Select
                            className="width-100"
                            placeholder={"Select a default year"}
                            defaultValue={configStyle.XAxis.default || null}
                            onChange={this.onDefaultYearChange}
                            status={configStyle.XAxis.default ? undefined : "error"}
                        >
                            {PlotlyUtils.getYears(blockData).map((value) => (
                                <Option key={value} value={value}>
                                    {value}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </>
        )
    }
}
