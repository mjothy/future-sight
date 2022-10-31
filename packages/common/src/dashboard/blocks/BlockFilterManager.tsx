import React, { Component } from 'react';
import BlockModel from '../../models/BlockModel';
import ConfigurationModel from '../../models/ConfigurationModel';
import ControlBlockEditor from './control/ControlBlockEditor';
import DataBlockEditor from './data/DataBlockEditor';

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

    componentDidMount(): void {
        this.initialize();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // the second condition to not update the dropdown list of ControlData
        if (prevProps.blockSelectedId !== this.props.blockSelectedId || this.props.selectedFilter !== prevProps.selectedFilter || this.props.dashboard != prevProps.dashboard) {
            this.initialize();
            this.updateDropdownData();
        }
    }

    /**
     * Initialise the state of component
     */
    initialize = () => {
        const currentBlock =
            this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
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
        if (this.props.selectedFilter !== '') {
            const selectedFilter = this.props.selectedFilter;
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
            this.setState({ data, initializedData: data }, () =>
                this.updateDropdownData()
            );
        }
    };

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
        const metaData =
            this.props.dashboard.blocks[this.props.blockSelectedId].config.metaData;
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

                // Check if data exist in the top filter (data focus)
                if (option === this.props.selectedFilter) {
                    const selectedFilter =
                        this.props.dashboard.dataStructure[this.props.selectedFilter]
                            .selection;
                    if (!selectedFilter.includes(optionValue)) {
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
