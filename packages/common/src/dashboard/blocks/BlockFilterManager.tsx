import { notification } from 'antd';
import React, { Component } from 'react';
import ConfigurationModel from '../../models/ConfigurationModel';
import ControlBlockEditor from './control/ControlBlockEditor';
import DataBlockEditor from './data/DataBlockEditor';
import { getBlock } from './utils/BlockDataUtils';

export default class BlockFilterManager extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            /**
             * Data options in dropDown Inputs
             */
            optionsData: {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
            }
        };
    }

    async componentDidMount(): Promise<void> {
        await this.updateDropdownData();
        await this.checkIfSelectedInOptions();
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        // the second condition to not update the dropdown list of ControlData
        if (prevProps.blockSelectedId !== this.props.blockSelectedId || this.props.dashboard != prevProps.dashboard) {
            await this.updateDropdownData();
            await this.checkIfSelectedInOptions();
        }
    }

    /**
     * Check if data in selection (selected data) are present in Select options
     */
    checkIfSelectedInOptions = () => {
        const options = this.props.options;
        const selected = this.props.currentBlock.config.metaData;

        const blockUpdatedData = { ...this.props.currentBlock.config.metaData };

        options.forEach(option => {
            const existData = selected[option].filter(data => this.state.optionsData[option].includes(data));

            if (existData.length < selected[option].length) {
                blockUpdatedData[option] = existData;
                this.props.updateBlockMetaData({ ...blockUpdatedData }, this.props.currentBlock.id);
                notification.warning({
                    message: 'Data missing',
                    description: 'Some selected data are not available  in existing options (due to your latest modifications), block will be updated automatically ',
                    placement: 'top',
                });
            }
        });
    }

    updateDropdownData = () => {
        const selectedData = this.getSelectedData();

        console.log("selectedData (filter): ", selectedData);
        this.filtreOptions(selectedData);
    };

    /**
     * Get all selected data in current block
     * @returns return {regions: [], variables: [], .....}
     */
    getSelectedData = () => {
        const selectedData = {
            regions: [],
            variables: [],
            scenarios: [],
            models: [],
        };
        const metaData = this.props.currentBlock.config.metaData;
        const controlBlock = getBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);
        this.props.options.forEach((option) => {
            if (controlBlock.id === undefined) {
                selectedData[option] = metaData[option];
            } else {
                // if block is controlled, we get selected data from the block master
                const controlConfig = controlBlock.config as ConfigurationModel;
                if (controlConfig.metaData.master[option].isMaster) {
                    selectedData[option] = controlConfig.metaData[option];
                } else {
                    selectedData[option] = metaData[option];
                }
            }
        });
        return selectedData;
    }

    /**
     * Update options of drop down lists (filter)
     * @param selectedData selected data (block metaData)
     */
    filtreOptions = (selectedData) => {
        const optionsData = {
            regions: new Set<string>(),
            variables: new Set<string>(),
            scenarios: new Set<string>(),
            models: new Set<string>(),
        };
        const options = this.props.options;
        let uncontroledOptions = [...this.props.options];
        const filtreByDataFocus = this.props.filtreByDataFocus;
        const globalFiltersJson = this.props.filters;

        // set controlled options
        const controlBlock = getBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);
        if (controlBlock.id !== undefined) {
            const controlConfig = controlBlock.config as ConfigurationModel;
            uncontroledOptions = this.props.options.filter(option => {
                if (controlConfig.metaData.master[option].isMaster) {
                    optionsData[option] = selectedData[option]
                } else {
                    return option;
                }
            });
        }

        // set uncontrolled options
        uncontroledOptions.forEach((option) => {
            filtreByDataFocus[option].forEach((optionValue) => {
                let isExist = true;
                options.forEach((filterKey) => {
                    if (option !== filterKey) {
                        selectedData[filterKey].forEach((value) => {
                            if (
                                !globalFiltersJson[option][optionValue][filterKey].includes(value)
                            ) {
                                isExist = false;
                            }
                        });
                    }
                });

                if (isExist) {
                    optionsData[option].add(optionValue);
                }
            });
        });

        options.forEach((option) => {
            optionsData[option] = Array.from(optionsData[option]);
        });

        this.setState({ optionsData });
    };

    onChange = (option, selectedData: string[]) => {
        const data = {};
        data[option] = selectedData;
        this.props.updateBlockMetaData({ ...data }, this.props.currentBlock.id);
    };

    render() {
        return this.props.currentBlock.blockType === 'data' ? (
            <DataBlockEditor
                {...this.props}
                onChange={this.onChange}
                optionsData={this.state.optionsData}
            />
        ) : (
            <ControlBlockEditor
                {...this.props}
                onChange={this.onChange}
                optionsData={this.state.optionsData}
            />
        );
    }
}
