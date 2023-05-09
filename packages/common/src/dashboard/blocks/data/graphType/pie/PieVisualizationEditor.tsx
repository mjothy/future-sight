import { Checkbox, Col, Row, Select } from 'antd';
import { Component } from 'react';
import PlotlyUtils from "../../../../graphs/PlotlyUtils";
import PlotDataModel from "../../../../../models/PlotDataModel";

const { Option } = Select;

export default class PieVisualizationEditor extends Component<any, any> {

    constructor(props) {
        super(props);
    }

    getAvailableYears = (blockData: PlotDataModel[]) => {
        const data = PlotlyUtils.filterByCustomXRange(blockData, this.props.currentBlock.config.configStyle)
        return PlotlyUtils.getYears(data)
    }

    onDefaultYearChange = (selectedYear: string) => {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
        configStyle.XAxis.default = selectedYear;
        this.props.updateBlockConfig({ configStyle: configStyle })
    };

    onUseSliderChecked = (e) => {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
        configStyle.XAxis.useSlider = e.target.checked;
        this.props.updateBlockConfig({ configStyle: configStyle })
    };

    onIsDonutChecked = (e) => {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
        configStyle.pie.isDonut = e.target.checked;
        this.props.updateBlockConfig({ configStyle: configStyle })
    };

    onShowPercentChecked = (e) => {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
        configStyle.pie.showPercent = e.target.checked;
        this.props.updateBlockConfig({ configStyle: configStyle })
    };

    onShowSubtitleChecked = (e) => {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle);
        configStyle.pie.showSubtitle = e.target.checked;
        this.props.updateBlockConfig({ configStyle: configStyle })
    };

    render() {
        const configStyle = structuredClone(this.props.currentBlock.config.configStyle)
        const blockData = this.props.blockData(this.props.currentBlock)
        return (
            <>
                <h3>Pie</h3>
                <Row style={{ marginBottom: 2 }}>
                    <Col span={2}></Col>
                    <Col span={16}>
                        Stack by:
                    </Col>
                </Row>
                <Row className="mb-10">
                    <Col span={2}></Col>
                    <Col span={16}>
                        <Select
                            className="width-100"
                            placeholder={"Select a slice category"}
                            value={configStyle.stack.value || null}
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

                <Row style={{ marginBottom: 2 }}>
                    <Col span={2}>
                    </Col>
                    <Col span={16}>
                        Choose default year:
                    </Col>
                </Row>
                <Row className="mb-10">
                    <Col span={2} />
                    <Col span={16}>
                        <Select
                            className="width-100"
                            placeholder={"Select a default year"}
                            value={configStyle.XAxis.default || null}
                            onChange={this.onDefaultYearChange}
                            status={this.getAvailableYears(blockData).includes(configStyle.XAxis.default) ? undefined : "error"}
                        >
                            {this.getAvailableYears(blockData).map((value) => (
                                <Option key={value} value={value}>
                                    {value}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>


                <Row>
                    <Col span={2} className={'checkbox-col'}>
                        <Checkbox
                            onChange={this.onUseSliderChecked}
                            checked={configStyle.XAxis.useSlider}
                        />
                    </Col>
                    <Col span={16} className={'checkbox-col-label'}>
                        <label>Use slider</label>
                    </Col>
                </Row>



                <Row>
                    <Col span={2} className={'checkbox-col'}>
                        <Checkbox
                            onChange={this.onIsDonutChecked}
                            checked={configStyle.pie.isDonut}
                        />
                    </Col>
                    <Col span={16} className={'checkbox-col-label'}>
                        <label>Use donut chart</label>
                    </Col>
                </Row>

                <Row>
                    <Col span={2} className={'checkbox-col'}>
                        <Checkbox
                            onChange={this.onShowPercentChecked}
                            checked={configStyle.pie.showPercent}
                        />
                    </Col>
                    <Col span={16} className={'checkbox-col-label'}>
                        <label>Use percent</label>
                    </Col>
                </Row>

                <Row>
                    <Col span={2} className={'checkbox-col'}>
                        <Checkbox
                            onChange={this.onShowSubtitleChecked}
                            checked={configStyle.pie.showSubtitle}
                        />
                    </Col>
                    <Col span={16} className={'checkbox-col-label'}>
                        <label>Show subtitles</label>
                    </Col>
                </Row>

            </>
        )
    }
}
