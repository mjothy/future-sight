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
            initialoptionsData: {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
            },
            /**
             * Data options in dropDown Inputs
             */
            optionsData: { ...this.props.filtreByDataFocus },

            dataRaws: {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
            },
            missingData: {
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
        if (this.props.currentSelectedBlock != prevProps.currentSelectedBlock || prevProps.blockSelectedId !== this.props.blockSelectedId) {
            this.updateDropdownData();
        }
        if (this.props.plotData.length != prevProps.plotData.length) {
            this.missingData();
        }
    }

    updateDropdownData = () => {
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
            this.setState({ optionsData: res }, () => {
                this.props.checkIfSelectedInOptions(this.state.optionsData, this.props.currentBlock)
                this.missingData();
            })
        }).catch(err => console.error("error fetch: ", err));

    };

    missingData = () => {
        const metaData = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData));

        if (metaData.selectOrder.length == 4) {
            const existDataRaws = this.getExistingRaws(metaData);

            const data = {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
            }

            this.props.optionsLabel.forEach(option => {
                data[option] = Array.from(new Set(existDataRaws.map(raw => raw[option.slice(0, -1)])))
                data[option] = metaData[option].filter(value => !data[option].includes(value))
            })

            this.setState({ missingData: data });
        }
    };

    getExistingRaws = (metaData) => {
        const existDataRaws: any[] = [];

        metaData.models.forEach((model) => {
            metaData.scenarios.forEach((scenario) => {
                metaData.variables.forEach((variable) => {
                    metaData.regions.forEach((region) => {
                        const d = this.props.plotData.find(
                            (e) =>
                                e.model === model &&
                                e.scenario === scenario &&
                                e.variable === variable &&
                                e.region === region
                        );
                        if (d) {
                            existDataRaws.push({ model, scenario, variable, region });
                        }
                    });
                });
            });
        });
        return existDataRaws;
    }

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

    /**
     * Update block select order after close of inputSelect
     * @param option input label
     * @param e TRUE if input select open and FALSE if closed
     */
    onDropdownVisibleChange = (option, e) => {
        const dashboard = { ...this.props.dashboard };
        const config = this.props.currentBlock.config;
        if (!e && config.metaData[option].length > 0 && !config.metaData.selectOrder.includes(option)) {
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
                missingData={this.state.missingData}
            />
        ) : (
            <ControlBlockEditor
                {...this.props}
                onChange={this.onChange}
                optionsData={this.state.optionsData}
                onDropdownVisibleChange={this.onDropdownVisibleChange}
                missingData={this.state.missingData}
            />
        );
    }
}