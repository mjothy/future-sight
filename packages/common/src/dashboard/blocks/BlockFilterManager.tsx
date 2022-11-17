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
            /**
             * The data that we get by filter focus (add it on)
             */
            initializedData: {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
            },

            controlBlock: new BlockModel(),

            selectOptions: Object.keys(this.props.filters),
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
        const selectOptions = Object.keys(this.props.filters);

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
        const selectedFilter = getSelectedFilter(this.props.dashboard);

        if (selectedFilter !== '') {
            const data = this.state.data;

            // Set the filter selection
            data[selectedFilter] =
                this.props.dashboard.dataStructure[selectedFilter].selection;
            Object.keys(this.props.filters).forEach((option) => {
                if (option !== selectedFilter) {
                    data[selectedFilter].forEach((filterValue) => {
                        data[option] = Array.from(
                            new Set([
                                ...data[option],
                                ...this.props.filters[selectedFilter][filterValue][option],
                            ])
                        );
                    });
                }
            });
            this.setState({ data, initializedData: data });
        }
    };

    checkIfSelectedInOptions = () => {
        const options = this.state.data;
        const selected = this.props.currentBlock.config.metaData;

        const blockUpdatedData = { ...this.props.currentBlock.config.metaData };

        Object.keys(options).forEach(option => {
            const existData = selected[option].filter(data => options[option].includes(data));
            blockUpdatedData[option] = existData;

            if (existData.length < selected[option].length) {
                notification.warning({
                    message: 'Data missing',
                    description: 'Some selected data are not available  in existing options (due to your latest modifications), block will be updated automatically ',
                    placement: 'top',
                });
            }
        });
        this.props.updateBlockMetaData({ ...blockUpdatedData }, this.props.currentBlock.id);
    }

    checkIfBlockControlled = () => {
        const controlBlockId = this.props.currentBlock.controlBlock;
        let controlBlock = new BlockModel();
        if (controlBlockId !== '') {
            controlBlock = this.props.blocks[controlBlockId];
        }
        this.setState({ controlBlock });
    };

    updateDropdownData = () => {
        // The selected data
        const filter = {};
        // To set the filter options (what is already selected, so fetch the data based on what in selections )
        const metaData = this.props.currentBlock.config.metaData;
        Object.keys(this.props.filters).forEach((option) => {
            if (this.state.controlBlock.id === undefined) {
                filter[option] = metaData[option];
            } else {
                const controlConfig = this.state.controlBlock
                    .config as ConfigurationModel;

                if (controlConfig.metaData.master[option].isMaster) {
                    filter[option] = controlConfig.metaData[option];
                } else {
                    filter[option] = metaData[option];
                }
            }
        });
        //Update all options
        console.log("filter: ", filter);
        this.filtreOptions(filter);
    };

    /**
     * Update options of drop down lists
     * @param filter selected drop down lists with selected data values
     */
    filtreOptions = (filter) => {
        const optionData = {
            regions: new Set<string>(),
            variables: new Set<string>(),
            scenarios: new Set<string>(),
            models: new Set<string>(),
        };
        // Filter the inputes of columns based on the filters (selected drop down data)
        // Data union
        const filtersJSON = this.props.filters;
        Object.keys(filtersJSON).forEach((option) => {
            Object.keys(filtersJSON[option]).forEach((optionValue) => {
                let isExist = true;
                Object.keys(filter).forEach((filterKey) => {
                    if (option !== filterKey) {
                        filter[filterKey].forEach((value) => {
                            if (
                                !filtersJSON[option][optionValue][filterKey].includes(value)
                            ) {
                                isExist = false;
                            }
                        });
                    }
                });

                const selectedFilter = getSelectedFilter(this.props.dashboard);

                // Check if data exist in the top filter (data focus)
                if (option === selectedFilter) {
                    const filterSelection =
                        this.props.dashboard.dataStructure[selectedFilter]
                            .selection;
                    if (!filterSelection.includes(optionValue)) {
                        isExist = false;
                    }
                } else {
                    if (!this.state.initializedData[option].includes(optionValue)) {
                        isExist = false;
                    }
                }

                if (isExist) {
                    optionData[option].add(optionValue);
                }
            });
        });

        Object.keys(optionData).forEach((option) => {
            optionData[option] = Array.from(optionData[option]);
        });

        this.setState({ data: optionData });
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
        return this.props.blockType === 'data' ? (
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
