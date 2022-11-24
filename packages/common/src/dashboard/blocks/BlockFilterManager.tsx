import { notification } from 'antd';
import React, { Component } from 'react';
import BlockModel from '../../models/BlockModel';
import ConfigurationModel from '../../models/ConfigurationModel';
import ControlBlockEditor from './control/ControlBlockEditor';
import DataBlockEditor from './data/DataBlockEditor';
import { getSelectedFilter } from './utils/DashboardUtils';

export default class BlockFilterManager extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            /**
             * Data options in dropDown boxs
             */
            data: {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
            },

            // TODO: delete this from state, get the data from external function
            controlBlock: new BlockModel(),

            // TODO create a function that return selectOptions
            selectOptions: this.props.options,
        };
    }

    async componentDidMount(): Promise<void> {
        await this.initialize();
        await this.updateDropdownData();
        await this.checkIfSelectedInOptions();

    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        // the second condition to not update the dropdown list of ControlData
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
        const currentBlock = this.props.currentBlock.config.metaData;
        const selectOptions = this.props.options;
        // Set inputs that still emplty
        if (currentBlock.selectOrder.length > 0) {
            const newOptions: string[] = [];
            selectOptions.forEach((option) => {
                if (!currentBlock.selectOrder.includes(option)) {
                    newOptions.push(option);
                }
            });

            this.setState({ selectOptions: newOptions });
        } else {
            this.setState({ selectOptions });
        }

        this.checkIfBlockControlled();

        // Set options based on the initial filter, and after that updateDropdownData to filter by already selected data
        const selectedFilter = getSelectedFilter(this.props.dashboard.dataStructure);
        if (selectedFilter !== '') {
            this.setState({ data: this.props.filtreByDataFocus });
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
            const existData = selected[option].filter(data => this.state.data[option].includes(data));
            blockUpdatedData[option] = existData;

            console.log("existData: ", existData, "/ option: ", option);
            if (existData.length < selected[option].length) {
                notification.warning({
                    message: 'Data missing',
                    description: 'Some selected data are not available  in existing options (due to your latest modifications), block will be updated automatically ',
                    placement: 'top',
                });
            }
        });
        // this.props.updateBlockMetaData({ ...blockUpdatedData }, this.props.currentBlock.id);
    }

    checkIfBlockControlled = () => {
        const controlBlockId = this.props.currentBlock.controlBlock;
        let controlBlock = new BlockModel();
        if (controlBlockId !== '') {
            controlBlock = this.props.dashboard.blocks[controlBlockId];
        }
        this.setState({ controlBlock });
    };

    updateDropdownData = () => {
        // The selected data
        const selectedData = {};
        // To set the filter options (what is already selected, so fetch the data based on what in selections )
        const metaData = this.props.currentBlock.config.metaData;
        this.props.options.forEach((option) => {
            if (this.state.controlBlock.id === undefined) {
                selectedData[option] = metaData[option];
            } else {
                const controlConfig = this.state.controlBlock.config as ConfigurationModel;
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
        // set controlled options
        if (this.state.controlBlock.id !== undefined) {
            const controlConfig = this.state.controlBlock.config as ConfigurationModel;
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

        this.setState({ data: optionsData });
    };

    onChange = (option, selectedData: string[]) => {
        const data = {};
        data[option] = selectedData;
        this.props.updateBlockMetaData({ ...data }, this.props.currentBlock.id);
        this.updateDropdownData();
    };

    updateSelectOptions = (selectOptions) => {
        this.setState(
            {
                selectOptions,
            },
            () => this.updateDropdownData()
        );
    };
    render() {
        return this.props.currentBlock.blockType === 'data' ? (
            <DataBlockEditor
                {...this.props}
                updateDropdownData={this.updateDropdownData}
                isBlockControlled={
                    this.state.controlBlock.id !== undefined ? true : false
                }
                updateSelectOptions={this.updateSelectOptions}
                selectOptions={this.state.selectOptions}
                onChange={this.onChange}
                data={this.state.data}
            />
        ) : (
            <ControlBlockEditor
                {...this.props}
                updateDropdownData={this.updateDropdownData}
                isBlockControlled={
                    this.state.controlBlock.id !== undefined ? true : false
                }
                updateSelectOptions={this.updateSelectOptions}
                onChange={this.onChange}
                data={this.state.data}
            />
        );
    }
}
