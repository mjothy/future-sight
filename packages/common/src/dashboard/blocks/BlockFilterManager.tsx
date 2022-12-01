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

    componentDidMount() {
        const optionsData = this.updateDropdownData();
        this.checkIfSelectedInOptions(optionsData);
        this.setState({ optionsData })

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.blockSelectedId !== this.props.blockSelectedId || this.props.dashboard != prevProps.dashboard) {
            const optionsData = this.updateDropdownData();
            this.checkIfSelectedInOptions(optionsData);
            this.setState({ optionsData })
        }
    }

    /**
     * Check if data in selection (selected data) are present in Select options
     */
    checkIfSelectedInOptions = (optionsData) => {
        const optionsLabel = this.props.optionsLabel;
        const dashboard = { ...this.props.dashboard };
        const config = this.props.currentBlock.config;
        let isDashboardUpdated = false;
        optionsLabel.forEach(option => {
            const dataInOptionsData = config.metaData[option].filter(data => optionsData[option].includes(data));

            if (dataInOptionsData.length < config.metaData[option].length) {
                isDashboardUpdated = true;
                config.metaData[option] = dataInOptionsData;
                dashboard.blocks[this.props.currentBlock.id].config = { ...config };
            }
        });

        if (isDashboardUpdated) {
            this.props.updateDashboard(dashboard);
            notification.warning({
                message: 'Data missing',
                description: 'Some selected data are not available  in existing options (due to your latest modifications), block will be updated automatically ',
                placement: 'top',
            });
        }

    }

    updateDropdownData = () => {
        const selectedData = this.getSelectedData();

        console.log("selectedData (filter): ", selectedData);
        return this.filtreOptions(selectedData);
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
        this.props.optionsLabel.forEach((option) => {
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
        const optionsLabel = this.props.optionsLabel;
        let uncontroledOptionsLabel = [...this.props.optionsLabel];
        const filtreByDataFocus = this.props.filtreByDataFocus;
        const globalFiltersJson = this.props.filters;

        // set controlled options
        const controlBlock = getBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);
        if (controlBlock.id !== undefined) {
            const controlConfig = controlBlock.config as ConfigurationModel;
            uncontroledOptionsLabel = this.props.optionsLabel.filter(option => {
                if (controlConfig.metaData.master[option].isMaster) {
                    optionsData[option] = selectedData[option]
                } else {
                    return option;
                }
            });
        }

        // set uncontrolled options
        uncontroledOptionsLabel.forEach((option) => {
            filtreByDataFocus[option].forEach((optionValue) => {
                let isExist = true;
                optionsLabel.forEach((filterKey) => {
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

        optionsLabel.forEach((option) => {
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
