import React, {Component} from 'react';
import {Checkbox, Col, Collapse, Divider, Row, Tag, TreeSelect} from 'antd';
import SelectInput from '../utils/SelectInput';
import {ExclamationCircleOutlined, WarningOutlined} from '@ant-design/icons';
import {getUnselectedInputOptions} from '../utils/BlockDataUtils';
import BlockDataModel, {versionsModel} from "../../../models/BlockDataModel";
import BlockStyleModel from "../../../models/BlockStyleModel";
import './DataBlockEditor.css';
import DashboardModel from "../../../models/DashboardModel";

const {Panel} = Collapse;

/**
 * The form in sidebar to add/edit dara block
 */
export default class DataBlockEditor extends Component<any, any> {

    clearClick = (filterId, e) => {
        const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
        const config = JSON.parse(JSON.stringify(this.props.currentBlock.config));

        const index = config.metaData.selectOrder.indexOf(filterId);
        if (index >= 0) {
            const newSelectOrder = [...config.metaData.selectOrder].slice(0, index);
            const clearedFilters = [...config.metaData.selectOrder].slice(index);
            for (const clearedFilter of clearedFilters) {
                config.metaData[clearedFilter] = [];
            }

            if (
                ["models", "scenarios"].some(item => clearedFilters.includes(item))
            ) {
                config.metaData["versions"] = {}
            }

            config.metaData.selectOrder = [...newSelectOrder];
            dashboard.blocks[this.props.currentBlock.id].config = {...config};

            this.props.updateDashboard(dashboard);
            this.props.setStaleFiltersFromSelectOrder(newSelectOrder)
        }

        this.props.onDropdownVisibleChange(filterId, false)
    };

    onChange = (option, selectedData: string[]) => {
        if (selectedData.length <= 0) {
            this.clearClick(option, null);
        } else {
            this.props.onChange(option, selectedData);
        }
    }

    getMessage = (missing) => {
        let msg = '';
        missing.forEach(value => {
            msg = msg + value + ', ';
        })
        if (msg.length > 0) {
            msg = "No data for: " + msg.slice(0, -2);
        }
        return <><WarningOutlined/> {msg}</>;
    }

    selectDropDownInput = (option, selected) => {
        // In case the block is controlled
        const id = this.props.currentBlock.controlBlock;

        let isControlled = false;
        if (id !== '') {
            const controlBlock = this.props.dashboard.blocks[id].config.metaData;
            if (controlBlock.master[option].isMaster) {
                isControlled = true;
            }
        }

        const metaData = this.props.currentBlock.config.metaData;

        return (
            !isControlled && (
                <div className={selected ? 'transition' : ''} key={option}>
                    <Row className="width-100">
                        <h4>
                            {option}&nbsp;
                            <label className='warning-label'>
                                {
                                    this.props.isAllSelected()
                                    && this.props.missingData[option].length > 0
                                    && this.getMessage(this.props.missingData[option])
                                }
                            </label>
                        </h4>

                        <SelectInput
                            type={option}
                            className={"width-90"}
                            value={metaData[option]}
                            options={this.props.optionsData[option]}
                            onChange={this.onChange}
                            loading={this.props.isLoadingOptions[option]}
                            isClear={selected}
                            onClear={this.clearClick}
                            onDropdownVisibleChange={this.props.onDropdownVisibleChange}
                            enabled={(this.props.currentOpenedFilter == option) || (this.props.currentOpenedFilter == null)}
                            regroupOrphans={option === "regions" ? "Common regions" : undefined}
                        />
                    </Row>
                </div>
            )
        );
    };

    selectMeta = () => {
        const id = this.props.currentBlock.id;
        const metaData = this.props.dashboard.blocks[id].config.metaData;

        const onUseMetaIndicatorChecked = (e) => {
            const dashboard: DashboardModel = JSON.parse(JSON.stringify(this.props.dashboard));
            const config = JSON.parse(JSON.stringify(this.props.currentBlock.config));
            // Update config (metaData)
            config.metaData.useMetaIndicators = e.target.checked;
            if (!e.target.checked){
                config.metaData.metaIndicators={}
            }

            dashboard.blocks[this.props.currentBlock.id].config = { ...config };
            this.props.updateDashboard(dashboard)
            this.props.updateAllFiltersOptions()
        };


        const onMetaIndicatorsChange = (option, selectedData: string[]) => {
            const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
            const metaIndicators = dashboard.blocks[id].config.metaData.metaIndicators ?? {};
            const newValues = {}
            selectedData.forEach(element => {
                newValues[element] = metaIndicators[element] ?? {}
            })

            dashboard.blocks[id].config.metaData.metaIndicators = newValues;
            this.props.updateDashboard(dashboard)
        }

        const onSubMetaIndicatorsChange = (parentMeta, selectedData: string[]) => {
            const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
            const metaIndicators = dashboard.blocks[id].config.metaData.metaIndicators ?? {};
            const newValues = {};
            selectedData.forEach(element => {
                newValues[element] = this.props.metaIndicatorsOptions[parentMeta][element]
            })

            metaIndicators[parentMeta] = newValues;
            dashboard.blocks[id].config.metaData.metaIndicators = metaIndicators;
            this.props.updateDashboard(dashboard)
        }

        const clearClick = () => {
            const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
            dashboard.blocks[id].config.metaData.metaIndicators = {};
            this.props.updateDashboard(dashboard)
            this.props.onMetaDropdownVisibleChange("meta", false)
        }

        return (
            <>
                <Row className="mb-10">
                    <Col span={2} className={'checkbox-col'}>
                        <Checkbox
                            onChange={onUseMetaIndicatorChecked}
                            checked={metaData.useMetaIndicators}
                        />
                    </Col>
                    <Col span={16} className={'checkbox-col-label'}>
                        <label>Pre-filter with data tags</label>
                    </Col>
                </Row>

                <SelectInput
                    type={"meta"}
                    className={"width-90"}
                    value={Object.keys(metaData.metaIndicators ?? {})}
                    options={Object.keys(this.props.metaIndicatorsOptions)}
                    onChange={onMetaIndicatorsChange}
                    placeholder={"Tag categories"}
                    isClear={true}
                    onClear={clearClick}
                    enabled={metaData.useMetaIndicators && ((this.props.currentOpenedFilter == "meta") || (this.props.currentOpenedFilter == null))}
                    onDropdownVisibleChange={this.props.onMetaDropdownVisibleChange}
                />

                <Row align="stretch">
                    {
                        Object.keys(metaData.metaIndicators ?? {}).map(meta => {
                            return <Col span={11} style={{marginTop: 3, height: "100%"}} key={meta}>
                                {meta}
                                <SelectInput
                                    type={meta}
                                    className={"width-90"} value={Object.keys(metaData.metaIndicators[meta] ?? {})}
                                    options={Object.keys(this.props.metaIndicatorsOptions[meta] ?? {})}
                                    onChange={onSubMetaIndicatorsChange}
                                    placeholder={""}
                                    enabled={metaData.useMetaIndicators && ((this.props.currentOpenedFilter == meta) || (this.props.currentOpenedFilter == null))}
                                    onDropdownVisibleChange={this.props.onMetaDropdownVisibleChange}
                                />
                            </Col>
                        })
                    }
                </Row>
            </>
        );
    };

    controlledInputs = () => {
        const id = this.props.currentBlock.controlBlock;
        const controlBlock = this.props.dashboard.blocks[id].config.metaData;
        return Object.keys(controlBlock.master).map((key) => {
            if (controlBlock.master[key].isMaster) {
                return (
                    <div className='mt-20' key={"controlledInputs" + key}>
                        <h4>{key} &nbsp;
                            <label className='warning-label'>
                                {
                                    this.props.isAllSelected()
                                    && this.props.missingData[key].length > 0
                                    && this.getMessage(this.props.missingData[key])
                                }
                            </label>
                        </h4>
                        {
                            controlBlock[key].length <= 0 ?
                                <div>
                                    <p><ExclamationCircleOutlined/> No data selected</p>
                                </div> :
                                controlBlock[key].map(element => {
                                    let color = "default";
                                    if (controlBlock.master[key].values.includes(element)) {
                                        color = "blue";
                                    }
                                    return <Tag key={element} color={color}>{element}</Tag>
                                })
                        }
                    </div>
                );
            }
        });
    };

    sortByTitle = (a, b) => {
        const a_version = parseFloat(a.version)
        const b_version = parseFloat(b.version)
        if (a_version < b_version) {
            return 1;
        }
        if (a_version > b_version) {
            return -1;
        }
        return 0;
    }

    renderSelectVersions = () => {
        const controlId = this.props.currentBlock.controlBlock;
        const metaData: BlockDataModel = this.props.currentBlock.config.metaData
        const configStyle: BlockStyleModel = this.props.currentBlock.config.configStyle
        const versionOptions = this.props.optionsData.versions
        let disabled = true

        if (controlId !== "") {
            const controlBlockMeta = this.props.dashboard.blocks[controlId].config.metaData;
            if (
                (metaData.models.length != 0 || controlBlockMeta.master.models.isMaster)
                && (metaData.scenarios.length != 0 || controlBlockMeta.master.scenarios.isMaster)
            ) {
                disabled = false
            }
        } else {
            if ((metaData.models.length != 0) && (metaData.scenarios.length != 0)) {
                disabled = false
            }
        }

        const treeData: any[] = []
        if (versionOptions) {
            for (const model of Object.keys(versionOptions)) {
                const modelChildren: any[] = []
                for (const scenario of Object.keys(versionOptions[model])) {
                    const scenarioChildren: any[] = []
                    const defaultVersion = versionOptions[model][scenario].default?.id || ""
                    for (const version of versionOptions[model][scenario].values) {
                        if (version != null) {
                            const title = version.id == defaultVersion
                                ? `${version.version} (default)`
                                : `${version.version}`
                            scenarioChildren.push({
                                version: version, // For sorting
                                title: title,
                                value: JSON.stringify({model, scenario, version})
                            })
                        }
                    }
                    modelChildren.push({
                        title: scenario,
                        value: `${model} - ${scenario}`,
                        selectable: false,
                        children: scenarioChildren.sort(this.sortByTitle)
                    })
                }
                treeData.push({
                    title: model,
                    value: model,
                    selectable: false,
                    children: modelChildren
                })
            }
        }

        return (
            <div>
                <h4>versions</h4>
                {disabled &&
					<p className={"warning-label"}>
						<WarningOutlined/> &nbsp;
						Models and scenarios must be selected first
					</p>}
                <TreeSelect
                    className={"version-tree-select"}
                    showSearch
                    dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                    placeholder="Please select versions"
                    multiple
                    treeDefaultExpandAll
                    value={this.getDefaultTreeSelectValue()}
                    onChange={this.props.onVersionSelected}
                    treeData={treeData}
                    disabled={disabled}
                    removeIcon={<></>}
                />
                <Row>
                    <Col span={2} className={'checkbox-col'}>
                        <Checkbox
                            onChange={this.onShowWarningVersionChange}
                            checked={configStyle.showDeprecatedVersionWarning}
                        />
                    </Col>
                    <Col span={22} className={'checkbox-col-label'}>
                        <label>Show warning when deprecated version selected</label>
                    </Col>
                </Row>
                <Row>
                    <Col span={2} className={'checkbox-col'}>
                        <Checkbox
                            onChange={this.props.onShowNonDefaultRuns}
                            checked={metaData.showNonDefaultRuns}
                        />
                    </Col>
                    <Col span={22} className={'checkbox-col-label'}>
                        <label>Allow selection of filters without any default runs</label>
                    </Col>
                </Row>
            </div>
        )
    }

    onShowWarningVersionChange = (e) => {
        const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
        dashboard.blocks[this.props.currentBlock.id].config.configStyle.showDeprecatedVersionWarning = e.target.checked;
        this.props.updateDashboard(dashboard)
    }


    getDefaultTreeSelectValue = () => {
        const version_dict: versionsModel = this.props.currentBlock.config.metaData.versions
        const defaultValues: string[] = []
        for (const model in version_dict) {
            for (const scenario in version_dict[model]) {
                for (const version of version_dict[model][scenario]) {
                    defaultValues.push(JSON.stringify({model, scenario, version}))
                }
            }
        }
        return defaultValues
    }

    render() {
        const metaData = this.props.currentBlock.config.metaData;

        return (
            Object.keys(this.props.optionsData).length > 0 &&
			<div>
				<div>
                    {this.selectMeta()}

					<Divider />

                    {/* show inputs if they are controlled */}
                    {this.props.currentBlock.controlBlock !== '' && (
                        <div>
                            <strong>Controlled inputs</strong>
                            {this.controlledInputs()}
                            <Divider/>
                        </div>
                    )}

                    {/* show dropdown lists of selected  */}
                    {metaData.selectOrder.map((option) =>
                        this.selectDropDownInput(option, true)
                    )}

                    {metaData.selectOrder.length > 0 && <Divider/>}

                    {/* show dropdown lists of unselected  */}
					<table className="width-100">
						<tbody>
						<tr>
                            {getUnselectedInputOptions(this.props.currentBlock, this.props.optionsLabel).map((option) => (
                                <td key={option}>{this.selectDropDownInput(option, false)}</td>
                            ))}
						</tr>
						</tbody>
					</table>

                    {getUnselectedInputOptions(this.props.currentBlock, this.props.optionsLabel).length > 0 &&
						<Divider/>}

					<Collapse ghost>
						<Panel header="Advanced options" key="1">
                            {this.renderSelectVersions()}
						</Panel>
					</Collapse>
				</div>
			</div>
        );
    }
}
