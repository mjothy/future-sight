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
        const selectedData = this.getSelectedData();

        console.log("selectedData (filter): ", selectedData);
        const { optionsData, dataRaws } = this.filtreOptions(selectedData);

        this.setState({ optionsData, dataRaws }, () => {
            // this.props.checkIfSelectedInOptions(this.state.optionsData, this.state.currentBlockCopy);
        })
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

        // const raws = this.filter();
        // this.props.optionsLabel.map(option => {
        //     optionsData[option] = raws.map(raw => {
        //         return raw[option.slice(0, -1)];
        //     })
        // });

        // optionsLabel.forEach((option) => {
        //     optionsData[option] = Array.from(new Set(optionsData[option]));
        // });

        // console.log("optionsData: ", optionsData);

        return this.filter();
    };

    filter = () => {
        const optionsData = JSON.parse(JSON.stringify(this.state.initialoptionsData));
        const metaData = this.props.currentBlock.config.metaData;
        const options = this.props.optionsLabel;

        // Foreach index(option label [model, scenario, ....]) return the possible lines based on select order
        const dataRaws = this.setRaws();
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

    setRaws = () => {
        const metaData = this.props.currentBlock.config.metaData;
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
