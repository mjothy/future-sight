import { notification } from 'antd';
import React, { Component } from 'react';
import ConfigurationModel from '../../models/ConfigurationModel';
import ControlBlockEditor from './control/ControlBlockEditor';
import DataBlockEditor from './data/DataBlockEditor';
import { getControlBlock } from './utils/BlockDataUtils';
import { getSelectedFilter } from './utils/DashboardUtils';

export default class BlockFilterManager extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            /**
             * Data options in dropDown boxs
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
        await this.initialize();
        await this.updateDropdownData();
        await this.checkIfSelectedInOptions();
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        // the second condition to not update the dropdown list of ControlData
        // TODO delete initialize
        if (prevProps.blockSelectedId !== this.props.blockSelectedId) {
            await this.initialize();
            await this.updateDropdownData();
            await this.checkIfSelectedInOptions();
        }
        if (this.props.dashboard != prevProps.dashboard) {
            await this.initialize();
            this.updateDropdownData();
        }
    }

    /**
     * Initialise the state of component
     */
    initialize = () => {
        // Set options based on the initial filter, and after that updateDropdownData to filter by already selected data
        const selectedFilter = getSelectedFilter(this.props.dashboard.dataStructure);
        if (selectedFilter !== '') {
            this.setState({ optionsData: this.props.filtreByDataFocus });
        }
    };

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
        // The selected data
        const selectedData = {};
        // To set the filter options (what is already selected, so fetch the data based on what in selections )
        const metaData = this.props.currentBlock.config.metaData;
        const controlBlock = getControlBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);
        this.props.options.forEach((option) => {
            if (controlBlock.id === undefined) {
                selectedData[option] = metaData[option];
            } else {
                const controlConfig = controlBlock.config as ConfigurationModel;
                if (controlConfig.metaData.master[option].isMaster) {
                    selectedData[option] = controlConfig.metaData[option];
                } else {
                    selectedData[option] = metaData[option];
                }
            }
        });
        console.log("selectedData (filter): ", selectedData);
        this.filtreOptions(selectedData);
    };

    /**
     * Update options of drop down lists
     * @param selectedData selected data (block metaData)
     */
    filtreOptions = (selectedData) => {
        const optionsData = {
            regions: new Set<string>(),
            variables: new Set<string>(),
            scenarios: new Set<string>(),
            models: new Set<string>(),
        };
        // Filter the inputes of columns based on the filters (selected drop down data)
        // Data union
        const options = this.props.options;
        let uncontroledOptions = [...this.props.options];
        const filtreByDataFocus = this.props.filtreByDataFocus;
        const globalFiltersJson = this.props.filters;
        const controlBlock = getControlBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);
        // set controlled options
        if (controlBlock.id !== undefined) {
            const controlConfig = controlBlock.config as ConfigurationModel;
            uncontroledOptions = this.props.options.filter(option => {
                if (controlConfig.metaData.master[option].isMaster) {
                    optionsData[option] = selectedData[option]
                } else {
                    return option
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
        this.updateDropdownData();
    };

    render() {
        return this.props.currentBlock.blockType === 'data' ? (
            <DataBlockEditor
                {...this.props}
                updateDropdownData={this.updateDropdownData}
                onChange={this.onChange}
                optionsData={this.state.optionsData}
            />
        ) : (
            <ControlBlockEditor
                {...this.props}
                updateDropdownData={this.updateDropdownData}
                onChange={this.onChange}
                optionsData={this.state.optionsData}
            />
        );
    }
}
