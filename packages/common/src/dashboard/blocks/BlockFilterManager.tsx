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
            optionsData: {}
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
        const optionsData = this.filtreOptions(selectedData);
        this.setState({ optionsData })
        this.props.checkIfSelectedInOptions(optionsData, this.props.currentBlock);
    };

    /**
     * Get all selected data in current block
     * @returns return {regions: [], variables: [], .....}
     */
    getSelectedData = () => {
        const selectedData = {};
        const metaData = this.props.currentBlock.config.metaData;
        const controlBlock = getControlBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);

        Object.keys(this.props.filtersDefinition).forEach((filter_id) => {
            if (!controlBlock) {
                selectedData[filter_id] = metaData.filters[filter_id];
            } else {
                // if block is controlled, we get selected data from the block master
                const controlConfig = controlBlock.config as ConfigurationModel;
                if (controlConfig.metaData.master[filter_id].isMaster) {
                    // TODO CHECK What is the difference between metadata.master.values and metadata.filters[filter_id]
                    // Might assign controlConfig.metaData.master[filter_id].values instead
                    selectedData[filter_id] = controlConfig.metaData.filters[filter_id];
                } else {
                    selectedData[filter_id] = metaData.filters[filter_id];
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
        const optionsData: {[filter_id: string]: any} = Object.fromEntries(
            Object.keys(this.props.filtersDefinition).map(
                (filter_id)=>[filter_id, new Set<string>()]
            )
        );
        const filtersId = Object.keys(this.props.filtersDefinition);
        let uncontrolledFiltersId = [...filtersId];
        const filterByDataFocus = this.props.filterByDataFocus;
        const globalFiltersJson = this.props.filters;

        // set controlled options
        const controlBlock = getControlBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);
        if (controlBlock) {
            const controlConfig = controlBlock.config as ConfigurationModel;
            uncontrolledFiltersId = uncontrolledFiltersId.filter(filter_id => {
                if (controlConfig.metaData.master[filter_id].isMaster) {
                    optionsData[filter_id] = selectedData[filter_id]
                } else {
                    return filter_id;
                }
            });
        }

        // TODO not optimal, right now filterByDataFocus should have only 1 key/values as we can select
        //  only one filter in popupfilter
        // set uncontrolled options
        uncontrolledFiltersId.forEach((filter_id) => {
            filterByDataFocus[filter_id]?.forEach((focusValue) => {
                let isExist = true;
                const filters_without_filter_id = filtersId.filter((id)=>id!==filter_id)
                filters_without_filter_id.forEach((filterKey) => {
                    selectedData[filterKey].forEach((value) => {
                        if (
                            !globalFiltersJson[filter_id][focusValue][filterKey].includes(value)
                        ) {
                            isExist = false;
                        }
                    });
                });

                if (isExist) {
                    optionsData[filter_id].add(focusValue);
                }
            });
        });

        filtersId.forEach((filter_id) => {
            optionsData[filter_id] = Array.from(optionsData[filter_id].values());
        });

        return optionsData;
    };

    onChange = (filter_id, selectedData: string[]) => {
        const dashboard = { ...this.props.dashboard };
        const config = this.props.currentBlock.config;
        // Update config (metaData)
        config.metaData.filters[filter_id] = selectedData;
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
