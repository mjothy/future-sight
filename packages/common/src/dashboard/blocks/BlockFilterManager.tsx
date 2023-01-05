import React, { Component } from 'react';
import ConfigurationModel from '../../models/ConfigurationModel';
import ControlBlockEditor from './control/ControlBlockEditor';
import DataBlockEditor from './data/DataBlockEditor';
import { getBlock } from './utils/BlockDataUtils';
import { getSelectedFilter } from './utils/DashboardUtils';

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
        if (this.props.dashboard != prevProps.dashboard || prevProps.blockSelectedId !== this.props.blockSelectedId) {
            this.updateDropdownData();
        }
    }

    updateDropdownData = () => {
        // const { optionsData, dataRaws } = this.filtreOptions();
        const filters = {
            regions: [],
            variables: [],
            scenarios: [],
            models: [],
        };

        let metaData = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData));
        const currentBlock = this.props.currentBlock;


        if (currentBlock.controlBlock !== '') {
            metaData = this.getMetaDataIfControlled();
        }

        const selectedFilter = getSelectedFilter(this.props.dashboard.dataStructure);
        filters[selectedFilter] = this.props.filtreByDataFocus[selectedFilter];
        this.props.dataManager.fetchDataOptions({ filters, metaData }).then(res => {
            this.setState({ optionsData: res }, () => this.props.checkIfSelectedInOptions(this.state.optionsData, this.props.currentBlock))
        }).catch(err => console.error("error fetch: ", err));

    };

    // /**
    //  * Update options of drop down lists (filter)
    //  */
    // filtreOptions = () => {
    //     const optionsData = JSON.parse(JSON.stringify(this.state.initialoptionsData));
    //     let metaData = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData));
    //     const options = this.props.optionsLabel;
    //     const currentBlock = this.props.currentBlock;

    //     if (currentBlock.controlBlock !== '') {
    //         metaData = this.getMetaDataIfControlled();
    //     }

    //     // Foreach index in [model, scenario, ....] return the possible raws
    //     const dataRaws = this.getRaws(metaData);

    //     if (metaData.selectOrder.length > 0) {
    //         // Filter options in drop down list based on data selection (metaData)
    //         this.props.optionsLabel.forEach(to_filter_option => {
    //             this.props.optionsLabel.forEach(other_option => {
    //                 if (to_filter_option !== other_option) {
    //                     metaData[other_option].forEach(selectedValue => {
    //                         const possible_options = new Set();
    //                         //Filter on options in dropdown list of "to_filter_option"
    //                         //Check for each value if exist raw with selected data in other options label
    //                         optionsData[to_filter_option].forEach(value => {
    //                             if (dataRaws[to_filter_option].find(raw => raw[to_filter_option.slice(0, -1)] === value && raw[other_option.slice(0, -1)] === selectedValue)) {
    //                                 possible_options.add(value);
    //                             }
    //                         })
    //                         optionsData[to_filter_option] = possible_options;
    //                     })
    //                 }
    //             })
    //         })
    //     }

    //     options.forEach(option => {
    //         optionsData[option] = Array.from(new Set(optionsData[option]));
    //     })
    //     return { optionsData, dataRaws };
    // }


    // /**
    //  * Get possible raws based on selected order config.metaData.selectOrder
    //  * Exemple: selectOrder = [regions, models]
    //  * dataRaws[models] will contains all raws of selected regions
    //  * @param metaData the selected data in current block
    //  * @returns possible raws of {model,scenario,region,variable} in each index based on the before selection
    //  */
    // getRaws = (metaData) => {
    //     const dataRaws = { ...this.state.dataRaws }

    //     if (metaData.selectOrder.length > 0) {
    //         const option_unselected = this.props.optionsLabel.filter(option => !metaData.selectOrder.includes(option));
    //         const option_selected = metaData.selectOrder;

    //         const option = metaData.selectOrder[0];
    //         dataRaws[option] = this.props.firstFilterRaws;

    //         // set possible raws for selected inputs
    //         for (let i = 1; i < option_selected.length; i++) {
    //             const current_option = metaData.selectOrder[i];
    //             const prev_option = metaData.selectOrder[i - 1];
    //             dataRaws[current_option] = dataRaws[prev_option].filter(raw => metaData[prev_option].includes(raw[prev_option.slice(0, -1)]));
    //         }

    //         // set possible raws for unselected inputs
    //         if (option_unselected.length > 0) {
    //             const prev_option = metaData.selectOrder[metaData.selectOrder.length - 1];// last label selected (drop down)
    //             const possible_raws = dataRaws[prev_option].filter(raw => metaData[prev_option].includes(raw[prev_option.slice(0, -1)]));
    //             option_unselected.forEach((option) => {
    //                 dataRaws[option] = possible_raws;
    //             })
    //         }
    //     }
    //     return dataRaws;
    // }

    /**
     * Get meta data of controlled options of current data block
     * @returns meta data
     */
    getMetaDataIfControlled = () => {
        const optionsData = JSON.parse(JSON.stringify(this.props.filtreByDataFocus));
        const metaData = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData));
        const controlBlock = getBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);
        const masterMetaData = (controlBlock.config as ConfigurationModel).metaData;
        Object.keys(masterMetaData.master).forEach((option) => {
            if (masterMetaData.master[option].isMaster) {
                optionsData[option] = masterMetaData[option];
                metaData[option] = masterMetaData[option];
            }
        });

        return metaData;
    }

    onDropdownVisibleChange = (option, e) => {
        const dashboard = { ...this.props.dashboard };
        const config = this.props.currentBlock.config;
        if (!e && config.metaData[option].length > 0) {
            // Update the order of selection
            config.metaData.selectOrder = Array.from(
                new Set<string>([...config.metaData.selectOrder, option])
            );
            dashboard.blocks[this.props.currentBlock.id].config = { ...config };
            this.props.updateDashboard(dashboard);
        }
    };

    onChange = (option, selectedData: string[]) => {
        const dashboard = { ...this.props.dashboard };
        const config = this.props.currentBlock.config;
        // Update config (metaData)
        config.metaData[option] = selectedData;
        dashboard.blocks[this.props.currentBlock.id].config = { ...config };

        if (this.props.currentBlock.blockType === 'control') {
            dashboard.blocks[this.props.currentBlock.id].config.metaData.master[option].values = []; // clear selected data on control view
            this.updateChildsBlocks(dashboard, this.props.currentBlock.id); //clear selected values of childs
        }
        this.props.updateDashboard(dashboard)
    };

    updateChildsBlocks = (dashboard, controlBlockId) => {
        const configParent = this.props.dashboard.blocks[controlBlockId].config;

        Object.values(dashboard.blocks).forEach((block: any) => {
            if (block.controlBlock === this.props.currentBlock.id) {
                block.config.metaData.selectOrder = configParent.metaData.selectOrder;
                this.props.optionsLabel.forEach(option => {
                    (block.config as ConfigurationModel).metaData[option] = [];
                });
            }
        })
    }

    render() {
        return this.props.currentBlock.blockType === 'data' ? (
            <DataBlockEditor
                {...this.props}
                onChange={this.onChange}
                optionsData={this.state.optionsData}
                onDropdownVisibleChange={this.onDropdownVisibleChange}
            />
        ) : (
            <ControlBlockEditor
                {...this.props}
                onChange={this.onChange}
                optionsData={this.state.optionsData}
                onDropdownVisibleChange={this.onDropdownVisibleChange}
            />
        );
    }
}