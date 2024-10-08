import React, {Component} from 'react';
import ConfigurationModel from '../../models/ConfigurationModel';
import OptionsDataModel from '../../models/OptionsDataModel';
import ControlBlockEditor from './control/ControlBlockEditor';
import DataBlockEditor from './data/DataBlockEditor';
import {getBlock} from './utils/BlockDataUtils';
import BlockDataModel, {versionsModel} from "../../models/BlockDataModel";
import {getSelectedFiltersLabels} from './utils/DashboardUtils';
import {BlockModel} from "../../index";

export default class BlockFilterManager extends Component<any, any> {
    constructor(props) {
        super(props);
        const metadata = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData))
        this.state = {
            ...this.getInitState(metadata),
            metaIndicatorsOptions: {},
            forceOptionsDataUpdate: false
        }
    }

    getInitState = (metadata) => {
        return {
            /**
             * Data options in dropDown Inputs
             */
            optionsData: this.initOptionsData(metadata),
            missingData: {
                regions: [],
                variables: [],
                scenarios: [],
                models: []
            },
            staleFilters: {
                regions: true,
                variables: true,
                scenarios: true,
                models: true
            },
            currentOpenedFilter: null,
            isLoadingOptions: {
                regions: false,
                variables: false,
                scenarios: false,
                models: false
            },
            currentSelection: [], // When opening a selectInput, store its value here to compare when closing
        };
    }

    initOptionsData = (metadata) => {
        const optionsData = {
            regions: metadata["regions"],
            variables: metadata["variables"],
            scenarios: metadata["scenarios"],
            models: metadata["models"],
            versions: this.initVersionOptions(metadata["versions"])
        }

        const id = this.props.currentBlock.controlBlock;
        if (id != null && id != '') { // Control dataBlock
            const controlBlockMetaData = this.props.dashboard.blocks[id].config.metaData;
            const masterKeys = Object.keys(controlBlockMetaData.master).filter((key) => controlBlockMetaData.master[key].isMaster);
            masterKeys.forEach(key => optionsData[key] = controlBlockMetaData[key]);
        }

        return optionsData;
    }

    initVersionOptions = (versionsMetadata: versionsModel) => {
        const tempVersions = JSON.parse(JSON.stringify(versionsMetadata))
        for (const model of Object.keys(versionsMetadata)) {
            for (const scenario of Object.keys(versionsMetadata[model])) {
                tempVersions[model][scenario] = {
                    default: "",
                    values: tempVersions[model][scenario]
                }
            }
        }

        return tempVersions
    }


    async componentDidMount() {
        const metaIndicatorsOptions = await this.props.dataManager.fetchMeta();
        const metaData = this.props.currentBlock.config.metaData;

        if (metaData.metaIndicators != null && Object.keys(metaData.metaIndicators)?.length > 0) {
            metaData.selectOrder.map(async filterId => {
                await this.updateFilterOptions(filterId);
            })
        }

        this.setState({metaIndicatorsOptions}, async () => {
            if (metaData["scenarios"].length > 0 && metaData["models"].length > 0) {
                await this.updateFilterOptions("versions")
            }
        });

        this.updateMissingData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const metadata = this.props.currentBlock.config.metaData
        const prevMetadata = prevProps.currentBlock.config.metaData

        if (
            JSON.stringify(this.props.plotData[this.props.currentBlock.id]) !== JSON.stringify(prevProps.plotData[this.props.currentBlock.id]) ||
            JSON.stringify(metadata.metaIndicators) !== JSON.stringify(prevMetadata.metaIndicators) // TODO Refactor: pass timeseries(this.props.plotData[this.props.currentBlock.id])) in props
        ) {
            this.updateMissingData();
        }

        // When changing block
        if (this.props.currentBlock.id !== prevProps.currentBlock.id) {
            this.setState(this.getInitState(metadata),
                () => {
                    if (metadata["scenarios"].length > 0 && metadata["models"].length > 0) {
                        this.updateFilterOptions("versions")
                    }
                }
            )
        }

        // Refresh selected filters and put to stale unselected filters. Do this in a componentDidUpdate so that
        // modification made to the dashboard are taken into account when updating the options
        if (this.state.forceOptionsDataUpdate != prevState.forceOptionsDataUpdate && this.state.forceOptionsDataUpdate) {
            const metaData = this.props.currentBlock.config.metaData;

            metaData.selectOrder.map(async filterId => {
                await this.updateFilterOptions(filterId);
            })
            if (metaData["scenarios"].length > 0 && metaData["models"].length > 0) {
                this.updateFilterOptions("versions")
            }

            // Set stale
            const staleFilters = {...this.state.staleFilters}
            Object.keys(staleFilters).forEach(key => {
                if (!metaData.selectOrder.includes(key)) {
                    staleFilters[key] = true;
                }
            })

            this.setState({staleFilters, forceOptionsDataUpdate: false})
        }
    }

    /**
     * Set forceOptionsDataUpdate flag to true
     */
    updateAllFiltersOptions = () => {
        this.setState({forceOptionsDataUpdate: true})
    }

    /**
     * Update input select options data for a filter
     * @param filterId filter to update
     */
    updateFilterOptions = (filterId: string) => {
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
                    isLoadingOptions: {...this.state.isLoadingOptions, [filterId]: false},
                }, async () => {
                    if (filterId == "versions") {
                        await this.updateBlockVersions(this.state.optionsData, this.props.currentBlock);
                    }
                    this.updateMissingData();
                })
            })
            .catch(err => {
                this.setState({
                    isLoadingOptions: {...this.state.isLoadingOptions, [filterId]: false}
                });
            })
    }

    /**
     * When refreshing versions from backend, update the versions of the block:
     * add default versions
     * remove versions that do not exist anymore
     *
     * @param optionsData updated options
     * @param block
     */
    updateBlockVersions = async (optionsData, block: BlockModel) => {
        const metaData = JSON.parse(JSON.stringify(((block.config) as ConfigurationModel).metaData));
        const versions = {};
        for (const model of metaData["models"]) {
            for (const scenario of metaData["scenarios"]) {
                if (!metaData["versions"]?.[model]?.[scenario] || metaData["versions"][model][scenario].length === 0) {
                    if (optionsData["versions"][model] && optionsData["versions"][model][scenario]) {
                        if (!versions[model]) {
                            versions[model] = {};
                        }
                        versions[model][scenario] = optionsData["versions"][model][scenario].default ?
                            [optionsData["versions"][model][scenario].default] :
                            [optionsData["versions"][model][scenario].values[0] ?? []] // here
                    }
                } else {
                    if (!versions[model]) {
                        versions[model] = {};
                    }
                    versions[model][scenario] = metaData["versions"][model][scenario];
                }
            }
        }
        metaData["versions"] = versions;

        // Update versions of current block
        const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
        dashboard.blocks[block.id as string].config.metaData = {...metaData};
        await this.props.updateDashboard(dashboard);
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
    updateMissingData = () => {
        const metaData = JSON.parse(JSON.stringify(this.props.currentBlock.config.metaData));

        if (this.isAllSelected()) {
            const existDataRaws = this.getExistingRaws(metaData);

            const data = new OptionsDataModel()

            this.props.optionsLabel.forEach(option => {
                data[option] = Array.from(new Set(existDataRaws.map(raw => raw[option.slice(0, -1)])))
                data[option] = metaData[option].filter(value => !data[option].includes(value))
            })

            this.setState({missingData: data});
        }
    };

    getExistingRaws = (metaData) => {
        const existDataRaws: any[] = [];
        let timeseriesData = this.props.plotData[this.props.currentBlock.id];

        if (!timeseriesData) {
            timeseriesData = []
        }

        metaData.models.forEach((model) => {
            metaData.scenarios.forEach((scenario) => {
                metaData.variables.forEach((variable) => {
                    metaData.regions.forEach((region) => {
                        const d = timeseriesData?.find(
                            (e) =>
                                e.model === model &&
                                e.scenario === scenario &&
                                e.variable === variable &&
                                e.region === region
                        );
                        if (d) {
                            if (d.data?.length > 0) {
                                existDataRaws.push({model, scenario, variable, region});
                            }
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
        if (isOpening) {

            if (this.state.currentOpenedFilter == null) {
                this.setState({
                    currentSelection: config.metaData[filterId],
                    currentOpenedFilter: filterId
                }, async () => {
                    const staleFilters = {...this.state.staleFilters}
                    if (staleFilters[filterId]) {
                        await this.updateFilterOptions(filterId)
                        staleFilters[filterId] = false
                        this.setState({staleFilters})
                    }
                })
            }

        }

        // onClose
        else {
            this.setState({currentOpenedFilter: null}, async () => {
                let selectOrder = config.metaData.selectOrder

                // add selected filter to selectOrder array
                if (config.metaData[filterId].length > 0 && !selectOrder.includes(filterId)) {
                    selectOrder = Array.from(
                        new Set<string>([...config.metaData.selectOrder, filterId])
                    );
                    dashboard.blocks[this.props.currentBlock.id].config.metaData.selectOrder = selectOrder
                    await this.props.updateDashboard(dashboard);
                }

                // Update missing data
                this.updateMissingData();

                // Check added and deleted options from selection
                if (config.metaData[filterId].length != this.state.currentSelection.length) {
                    const staleFilters = {...this.state.staleFilters}
                    const selectOrderIndex = selectOrder.indexOf(filterId)

                    // - higher idx filters
                    for (const tempFilterId of selectOrder.slice(selectOrderIndex + 1)) {
                        await this.updateFilterOptions(tempFilterId)
                    }

                    // Update unselected filter to stale
                    for (const tempFilterId of Object.keys(staleFilters).filter((x) => !selectOrder.includes(x))) {
                        staleFilters[tempFilterId] = true
                    }
                    this.setState({staleFilters: staleFilters})

                    // Update versions if model or scenario modified
                    const updatedFilters = selectOrder.slice(selectOrderIndex)
                    if (
                        ["models", "scenarios"].some(item => updatedFilters.includes(item))
                        && ["models", "scenarios"].every(item => selectOrder.includes(item))
                    ) {
                        await this.updateFilterOptions("versions")
                    }

                    /*for (const tempFilterId of selectOrder.slice(selectOrderIndex + 1)) {
                        await this.updateFilterOptions(tempFilterId)
                    }*/

                }
            })
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

        // TODO replace state_version_dict by version_dict: to update versions by only the selected versions
        // TODO update current_block.metaData.version of dashboard by the same value of optionsData.version (they are not synchroniszed)
        dashboard.blocks[this.props.currentBlock.id].config.metaData.versions = state_version_dict;

        const selectOrder = this.props.currentBlock.config.metaData.selectOrder

        // Update filters to stale
        const staleFilters = {...this.state.staleFilters}

        // -- Update filters with higher idx order than models and scenarios to stale
        const maxIdxModelScenario = Math.max(selectOrder.indexOf("models"), selectOrder.indexOf("scenarios"))
        for (const tempFilterId of selectOrder.slice(maxIdxModelScenario + 1)) {
            staleFilters[tempFilterId] = true
        }

        // -- Update unselected filter to stale
        for (const tempFilterId of Object.keys(staleFilters).filter((x) => !selectOrder.includes(x))) {
            staleFilters[tempFilterId] = true
        }

        this.setState({staleFilters: staleFilters},
            () => this.props.updateDashboard(dashboard)
        )

    };

    /**
     * On closing metaindicator select, update all selected filters.
     * Do not update when a metaindicator category is selected
     * @param filterId
     * @param isOpening
     */
    onMetaDropdownVisibleChange = async (filterId, isOpening) => {
        if (isOpening) {
            if (this.state.currentOpenedFilter == null) {
                this.setState({currentOpenedFilter: filterId})
            }
        } else {
            this.setState({currentOpenedFilter: null})
            if (filterId !== "meta") {
                this.updateAllFiltersOptions()
            }
        }
    }

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
            (x) => !newSelectOrder.includes(x)
        )

        for (const filter of filtersToStale) {
            tempStaleFilters[filter] = true
        }

        this.setState({
            staleFilters: tempStaleFilters
        })
    }

    isAllSelected = () => {
        return this.props.currentBlock.config.metaData.selectOrder.length == 4
    }

    onShowNonDefaultRuns = (e) => {
        const dashboard = JSON.parse(JSON.stringify(this.props.dashboard));
        dashboard.blocks[this.props.currentBlock.id].config.metaData.showNonDefaultRuns = e.target.checked;
        this.props.updateDashboard(dashboard)
        // set every update to stale
        this.setState({
            staleFilters: {
                regions: true,
                variables: true,
                scenarios: true,
                models: true
            }
        })
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
                onMetaDropdownVisibleChange={this.onMetaDropdownVisibleChange}
                currentOpenedFilter={this.state.currentOpenedFilter}
                onVersionSelected={this.onVersionSelected}
                setStaleFiltersFromSelectOrder={this.setStaleFiltersFromSelectOrder}
                isAllSelected={this.isAllSelected}
                onShowNonDefaultRuns={this.onShowNonDefaultRuns}
                initVersionOptions={this.initVersionOptions}
                metaIndicatorsOptions={this.state.metaIndicatorsOptions}
                updateAllFiltersOptions={this.updateAllFiltersOptions}
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
                currentOpenedFilter={this.state.currentOpenedFilter}
            />
        );
    }
}
