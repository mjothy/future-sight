import React, { Component } from 'react';
import ConfigurationModel from '../../models/ConfigurationModel';
import ControlBlockEditor from './control/ControlBlockEditor';
import DataBlockEditor from './data/DataBlockEditor';
import { getControlBlock } from './utils/BlockDataUtils';

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

    componentDidMount() {
        this.updateDropdownData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.blockSelectedId !== this.props.blockSelectedId || this.props.dashboard != prevProps.dashboard) {
            this.updateDropdownData();
        }
    }

    updateDropdownData = () => {
        const selectedData = this.getSelectedData();

        console.log("selectedData (filter): ", selectedData);
        const optionsData = this.filtreOptions(selectedData);

        this.setState({ optionsData })
        this.props.checkIfSelectedInOptions(optionsData, this.props.currentBlock);

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
        const controlBlock = getControlBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);
        this.props.filtersId.forEach((option) => {
            if (!controlBlock) {
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
        const filtersId = this.props.filtersId;
        let uncontrolledFiltersId = [...this.props.filtersId];
        const filterByDataFocus = this.props.filterByDataFocus;
        const globalFiltersJson = this.props.filters;

        // set controlled options
        const controlBlock = getControlBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);
        if (controlBlock) {
            const controlConfig = controlBlock.config as ConfigurationModel;
            uncontrolledFiltersId = this.props.filtersId.filter(option => {
                if (controlConfig.metaData.master[option].isMaster) {
                    optionsData[option] = selectedData[option]
                } else {
                    return option;
                }
            });
        }

        // set uncontrolled options
        uncontrolledFiltersId.forEach((option) => {
            filterByDataFocus[option].forEach((optionValue) => {
                let isExist = true;
                filtersId.forEach((filterKey) => {
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

        filtersId.forEach((option) => {
            optionsData[option] = Array.from(optionsData[option]);
        });

        return optionsData;
    };

    onChange = (option, selectedData: string[]) => {
        const dashboard = { ...this.props.dashboard };
        const config = this.props.currentBlock.config;
        // Update config (metaData)
        config.metaData[option] = selectedData;
        dashboard.blocks[this.props.currentBlock.id].config = { ...config };
        this.props.updateDashboard(dashboard)
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
