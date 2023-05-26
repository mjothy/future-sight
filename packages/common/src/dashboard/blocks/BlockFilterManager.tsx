import React, {Component} from 'react';
import ConfigurationModel from '../../models/ConfigurationModel';
import OptionsDataModel from '../../models/OptionsDataModel';
import ControlBlockEditor from './control/ControlBlockEditor';
import DataBlockEditor from './data/DataBlockEditor';
import {getBlock} from './utils/BlockDataUtils';
import BlockDataModel, {versionsModel} from "../../models/BlockDataModel";
import DashboardModel from "../../models/DashboardModel";
import { getSelectedFiltersLabels } from './utils/DashboardUtils';

export default class BlockFilterManager extends Component<any, any> {
    constructor(props) {
        super(props);
        const metadata = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData))
        this.state = this.getInitState(metadata)
    }

    getInitState = (metadata) => {
        return {
            /**
             * Data options in dropDown Inputs
             */
            optionsData: {
                regions: metadata["regions"],
                variables: metadata["variables"],
                scenarios: metadata["scenarios"],
                models: metadata["models"],
                categories: metadata["categories"],
                versions: this.initVersionOptions(metadata["versions"])
            },
            missingData: {
                regions: [],
                variables: [],
                scenarios: [],
                models: [],
                categories: []
            },
            staleFilters:{
                regions: true,
                variables: true,
                scenarios: true,
                models: true
            },
            isLoadingOptions:{
                regions: false,
                variables: false,
                scenarios: false,
                models: false
            },
            currentSelection: [] // When opening a selectInput, store its value here to compare when closing
        };
    }

    initVersionOptions = (versionsMetadata: versionsModel) => {
        const tempVersions = JSON.parse(JSON.stringify(versionsMetadata))
        for (const model of Object.keys(versionsMetadata)){
            for(const scenario of Object.keys(versionsMetadata[model])){
                tempVersions[model][scenario] = {
                    default: "",
                    values: tempVersions[model][scenario]
                }
            }
        }

        return tempVersions
    }

    componentDidMount() {
        const metadata = this.props.currentBlock.config.metaData
        if(metadata["scenarios"].length>0 && metadata["models"].length>0){
            this.updateFilterOptions("versions")
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.plotData[this.props.currentBlock.id]?.length != prevProps.plotData[this.props.currentBlock.id]?.length) {
            this.missingData();
        }
        if (this.props.currentBlock.id !== prevProps.currentBlock.id) {
            const metadata = this.props.currentBlock.config.metaData
            this.setState(this.getInitState(metadata),
                () => {
                    if(metadata["scenarios"].length>0 && metadata["models"].length>0){
                        this.updateFilterOptions("versions")
                    }
                }
            )
        }
    }



    /**
     * Update input select options data for a filter
     * @param filterId filter to update
     */
    updateFilterOptions = (filterId) => {
        const dataFocusFilters: { [indexType: string]: string[] } = {}; //the first filter(by data focus), only one key
        let metaData: BlockDataModel = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData));
        const currentBlock = this.props.currentBlock;

        if (currentBlock.controlBlock !== '') {
            metaData = this.getMetaDataIfControlled();
        }

        const selectedFilters = getSelectedFiltersLabels(this.props.dashboard.dataStructure);
        selectedFilters.forEach(filter => {
            dataFocusFilters[filter] = this.props.dashboard.dataStructure[filter].selection;
        })

        this.setState({isLoadingOptions: {...this.state.isLoadingOptions, [filterId]: true}})
        return this.props.dataManager.fetchFilterOptions({filterId, metaData, dataFocusFilters})
            .then(res => {
                let optionsData = JSON.parse(JSON.stringify(this.state.optionsData))
                optionsData = {...optionsData, ...res}
                this.setState({
                        optionsData,
                        isLoadingOptions: {...this.state.isLoadingOptions, [filterId]: false}
                    }, () => {
                    this.props.checkIfSelectedInOptions(this.state.optionsData, this.props.currentBlock)
                    this.missingData();
                })})
            .catch(err => console.error("error fetch: ", err));
    }

    /**
     * Get meta data of controlled options of current data block
     * @returns meta data
     */
    getMetaDataIfControlled = () => {
        const metaData = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData));
        const controlBlock = getBlock(this.props.dashboard.blocks, this.props.currentBlock.controlBlock);
        const masterMetaData = (controlBlock.config as ConfigurationModel).metaData;
        Object.keys(masterMetaData.master).forEach((option) => {
            if (masterMetaData.master[option].isMaster) {
                metaData[option] = masterMetaData[option];
            }
        });

        return metaData;
    }

    /**
     * set data that is not present in the graph of the block
     */
    missingData = () => {
        const metaData = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData));

        if (this.isAllSelected()) {
            const existDataRaws = this.getExistingRaws(metaData, this.props.currentBlock.id);

            const data = new OptionsDataModel()

            this.props.optionsLabel.forEach(option => {
                data[option] = Array.from(new Set(existDataRaws.map(raw => raw[option.slice(0, -1)])))
                data[option] = metaData[option].filter(value => !data[option].includes(value))
            })

            this.setState({missingData: data});
        }
    };

    getExistingRaws = (metaData, blockId) => {
        const existDataRaws: any[] = [];

        metaData.models.forEach((model) => {
            metaData.scenarios.forEach((scenario) => {
                metaData.variables.forEach((variable) => {
                    metaData.regions.forEach((region) => {
                        const d = this.props.plotData[blockId]?.find(
                            (e) =>
                                e.model === model &&
                                e.scenario === scenario &&
                                e.variable === variable &&
                                e.region === region
                        );
                        if (d) {
                            if (d.data != undefined)
                                existDataRaws.push({model, scenario, variable, region});
                        }
                    });
                });
            });
        });
        return existDataRaws;
    }


    /**
     * After closing inputSelect, add selected filter to selectOrder array
     * @param filterId input label
     * @param isOpening TRUE if input select opening and FALSE if closing
     */
    onDropdownVisibleChange = async (filterId, isOpening) => {
        const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
        const config = JSON.parse(JSON.stringify(this.props.currentBlock.config));

        // onOpen if filter is stale, fetch data
        if(isOpening){
            this.setState({currentSelection: config.metaData[filterId]})
            const staleFilters = {...this.state.staleFilters}
            if (staleFilters[filterId]){
                await this.updateFilterOptions(filterId)
                staleFilters[filterId] = false
                this.setState({staleFilters})
            }
        }

        // onClose
        else {
            let selectOrder = config.metaData.selectOrder

            // add selected filter to selectOrder array
            if (config.metaData[filterId].length > 0 && !selectOrder.includes(filterId)){
                selectOrder = Array.from(
                    new Set<string>([...config.metaData.selectOrder, filterId])
                );
                dashboard.blocks[this.props.currentBlock.id].config.metaData.selectOrder = selectOrder
                this.props.updateDashboard(dashboard);
            }

            // Check added and deleted options from selection
            const addedOptions = config.metaData[filterId].filter((x)=> !this.state.currentSelection.includes(x))
            const deletedOptions = this.state.currentSelection.filter((x) => !config.metaData[filterId].includes(x))

            if (deletedOptions.length>0){
                // Update unselected filter to stale
                const staleFilters = {...this.state.staleFilters}
                for (const tempFilterId of Object.keys(staleFilters).filter((x)=>!selectOrder.includes(x))){
                    staleFilters[tempFilterId] = true
                }
                this.setState({staleFilters: staleFilters})

                // Update cascade all higher idx filters
                const selectOrderIndex = selectOrder.indexOf(filterId)

                for (const tempFilterId of selectOrder.slice(selectOrderIndex+1)){
                    await this.updateFilterOptions(tempFilterId)
                }

                // Update versions if model or scenario modified
                const updatedFilters =selectOrder.slice(selectOrderIndex)
                if(
                    ["models", "scenarios"].some(item => updatedFilters.includes(item))
                    && ["models", "scenarios"].every(item => selectOrder.includes(item))
                ) {
                    this.updateFilterOptions("versions")
                }

            } else if (addedOptions.length>0){
                // Update higher idx and unselected filter to stale
                const staleFilters = {...this.state.staleFilters}
                const selectOrderIndex = selectOrder.indexOf(filterId)

                // - higher idx filters
                for (const tempFilterId of selectOrder.slice(selectOrderIndex+1)){
                    staleFilters[tempFilterId] = true
                }

                // - unselected filters
                for (const tempFilterId of Object.keys(staleFilters).filter((x)=>!selectOrder.includes(x))){
                    staleFilters[tempFilterId] = true
                }
                this.setState({staleFilters: staleFilters})

                // update versions if model or scenario modified
                if(
                    ["models", "scenarios"].includes(filterId)
                    && ["models", "scenarios"].every(item => selectOrder.includes(item))
                ){
                    this.updateFilterOptions("versions")
                }
            }
        }
    };

    // On select filter changes
    onChange = (filterId, selectedData: string[]) => {
        const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
        const config = JSON.parse(JSON.stringify(this.props.currentBlock.config));
        // Update config (metaData)
        config.metaData[filterId] = selectedData;
        dashboard.blocks[this.props.currentBlock.id].config = {...config};

        if (this.props.currentBlock.blockType === 'control') {
            dashboard.blocks[this.props.currentBlock.id].config.metaData.master[filterId].values = []; // clear selected data on control view
            this.updateChildsBlocks(dashboard, this.props.currentBlock.id); //clear selected values of childs
        }
        this.props.updateDashboard(dashboard)
    };

    onUseVersionSwitched = (checked) => {
        const dashboard: DashboardModel = JSON.parse(JSON.stringify(this.props.dashboard));
        const config = JSON.parse(JSON.stringify(this.props.currentBlock.config));
        // Update config (metaData)
        config.metaData.useVersion = checked;
        dashboard.blocks[this.props.currentBlock.id].config = {...config};
        this.props.updateDashboard(dashboard)
    };

     // When updating version tree select update metaData.versions.
    // Always keep one leaf selected
    onVersionSelected = (selectedValues: string[]) => {
        const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
        const state_version_dict: versionsModel = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData.versions));
        const version_dict: versionsModel = {};

        for (const rawValue of selectedValues) {
            const {model, scenario, version} = JSON.parse(rawValue)
            // Initialise versions[model] and versions[model][scenario]if not exist
            !(model in version_dict) && (version_dict[model] = {});
            !(scenario in version_dict[model]) && (version_dict[model][scenario] = []);

            // Update config
            version_dict[model][scenario].push(version);
        }

        for (const model in state_version_dict) {
            for (const scenario in state_version_dict[model]) {
                if (version_dict[model]?.[scenario]) {
                    state_version_dict[model][scenario] = version_dict[model][scenario]
                }
            }
        }

        dashboard.blocks[this.props.currentBlock.id].config.metaData.versions = state_version_dict;
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

    setStaleFiltersFromSelectOrder = (newSelectOrder: string[]) => {
        const tempStaleFilters = {...this.state.staleFilters}
        const filtersToStale = Object.keys(this.state.staleFilters).filter(
            (x)=>!newSelectOrder.includes(x)
        )

        for (const filter of filtersToStale){
            tempStaleFilters[filter]=true
        }

        this.setState({
            staleFilters: tempStaleFilters
        })
    }

    isAllSelected = () => {
        const selectedOrder = this.props.currentBlock.config.metaData.selectOrder;
        const obligatory = selectedOrder.filter(key => key != "categories");
        return obligatory.length == 4
    }

    render() {
        return this.props.currentBlock.blockType === 'data' ? (
            <DataBlockEditor
                {...this.props}
                optionsData={this.state.optionsData}
                missingData={this.state.missingData}
                isLoadingOptions={this.state.isLoadingOptions}
                onChange={this.onChange}
                onDropdownVisibleChange={this.onDropdownVisibleChange}
                onUseVersionSwitched={this.onUseVersionSwitched}
                onVersionSelected={this.onVersionSelected}
                setStaleFiltersFromSelectOrder={this.setStaleFiltersFromSelectOrder}
                isAllSelected={this.isAllSelected}
            />
        ) : (
            <ControlBlockEditor
                {...this.props}
                optionsData={this.state.optionsData}
                missingData={this.state.missingData}
                isLoadingOptions={this.state.isLoadingOptions}
                onChange={this.onChange}
                onDropdownVisibleChange={this.onDropdownVisibleChange}
                setStaleFiltersFromSelectOrder={this.setStaleFiltersFromSelectOrder}
            />
        );
    }
}
