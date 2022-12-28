import React, { Component } from 'react';
import ConfigurationModel from '../../models/ConfigurationModel';
import ControlBlockEditor from './control/ControlBlockEditor';
import DataBlockEditor from './data/DataBlockEditor';
import { getBlock } from './utils/BlockDataUtils';

export default class BlockFilterManager extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            initialoptionsData: {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
            },
            /**
             * Data options in dropDown Inputs
             */
            optionsData: {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
            },

            dataRaws: {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
            }
        };

        this.props.firstFilterRaws.forEach(raw => {
            this.props.optionsLabel.forEach(option => {
                this.state.optionsData[option].push(raw[option.slice(0, -1)]);
            })
        });
        this.props.optionsLabel.forEach(option => {
            // eslint-disable-next-line react/no-direct-mutation-state
            this.state.optionsData[option] = Array.from(new Set(this.state.optionsData[option]));
            this.state.initialoptionsData[option] = [...this.state.optionsData[option]];
            this.state.dataRaws[option] = this.props.firstFilterRaws;
        })
    }

    componentDidMount() {
        this.updateDropdownData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.dashboard != prevProps.dashboard) {
            this.updateDropdownData();
        }

        if (prevProps.blockSelectedId !== this.props.blockSelectedId) {
            const dataRaws = {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
            };
            this.props.optionsLabel.forEach(option => {
                dataRaws[option] = this.props.firstFilterRaws;
            })
            this.setState({ dataRaws }, () => this.updateDropdownData())
        }
    }

    updateDropdownData = () => {
        const { optionsData, dataRaws } = this.filtreOptions();
        this.setState({ optionsData, dataRaws })
    };

    /**
     * Update options of drop down lists (filter)
     */
    filtreOptions = () => {
        const optionsData = JSON.parse(JSON.stringify(this.state.initialoptionsData));
        let metaData = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData));
        const options = this.props.optionsLabel;
        const currentBlock = this.props.currentBlock;

        if (currentBlock.controlBlock !== '') {
            metaData = this.updateIfControlled();
        }

        // Foreach index(option label [model, scenario, ....]) return the possible lines based on select order
        const dataRaws = this.setRaws(metaData);
        if (metaData.selectOrder.length > 0) {
            this.props.optionsLabel.forEach(current_option => {
                this.props.optionsLabel.forEach(other_option => {
                    if (current_option !== other_option) {
                        if (metaData[other_option].length > 0) {
                            const possible_options = new Set();
                            optionsData[current_option].forEach(value => {
                                let isExist = true;
                                metaData[other_option].map(selectedValue => {
                                    if (!dataRaws[current_option].find(raw => raw[current_option.slice(0, -1)] === value && raw[other_option.slice(0, -1)] === selectedValue)) {
                                        isExist = false
                                    }
                                })
                                if (isExist) {
                                    possible_options.add(value);
                                }
                            })
                            optionsData[current_option] = possible_options;
                        }

                    }
                })
            })
        }

        options.forEach(option => {
            optionsData[option] = Array.from(new Set(optionsData[option]));
        })
        return { optionsData, dataRaws };
    }

    setRaws = (metaData) => {
        const dataRaws = { ...this.state.dataRaws }

        if (metaData.selectOrder.length > 0) {
            const option_unselected = this.props.optionsLabel.filter(option => !metaData.selectOrder.includes(option));
            const option_selected = metaData.selectOrder;
            // set possible raws for selected inputs
            for (let i = 1; i < option_selected.length; i++) {
                const current_option = metaData.selectOrder[i];
                const prev_option = metaData.selectOrder[i - 1];
                dataRaws[current_option] = dataRaws[prev_option].filter(raw => metaData[prev_option].includes(raw[prev_option.slice(0, -1)]));
            }
            // set possible raws for unselected inputs
            option_unselected.forEach((option) => {
                const current_option = option;
                const prev_option = metaData.selectOrder[metaData.selectOrder.length - 1]; // last label selected (drop down)
                dataRaws[current_option] = dataRaws[prev_option].filter(raw => metaData[prev_option].includes(raw[prev_option.slice(0, -1)]));
            })
        }
        return dataRaws;
    }

    updateIfControlled = () => {
        const optionsData = JSON.parse(JSON.stringify(this.state.initialoptionsData));
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
