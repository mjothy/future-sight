import {
    BlockDataModel,
    BlockModel,
    ComponentPropsWithDataManager,
    ConfigurationModel, DashboardModel,
    getControlBlock,
    ReadOnlyDashboard,
} from '@future-sight/common';
import {Component} from 'react';
import withDataManager from '../../services/withDataManager';
import {RoutingProps} from '../app/Routing';
import DashboardSelectionControl from './DashboardSelectionControl';
import {getDraft, removeDraft} from '../drafts/DraftUtils';
import Utils from '../../services/Utils';
import {Spin} from 'antd';
import FILTERS_DEFINITION from "../filter/FiltersDefinition";

export interface DashboardDataConfigurationProps
    extends ComponentPropsWithDataManager,
        RoutingProps {
    readonly?: boolean;
}

/**
 * To dispatch the data to all blocks of dashboard
 */
class DashboardDataConfiguration extends Component<
  DashboardDataConfigurationProps,
  any
> {
    filtersId: string[] = [];
    constructor(props) {
        super(props);
        const filtersId: string[] = [];
        const filters = {}
        const filterByDataFocus = {}
        this.state = {
            filters,
            filterByDataFocus,
            filtersId,
            /**
             * Data (with timeseries from IASA API)
             */
            plotData: [],
            isFetchData: false
        };

    }

    async componentDidMount() {
        try {
            const filters = {...this.state.filters};
            const filtersId = [...this.state.filtersId]
            for (const filter_def of Object.values(FILTERS_DEFINITION)) {
                filtersId.push(filter_def.id)
                filters[filter_def.id] = await this.props.dataManager.fetchFilter(filter_def.api_endpoint)
            }
            this.setState({filters, filtersId, isFetchData: true});
        } catch (error) {
            console.log("ERROR FETCH: ", error);
        }
    }

    saveData = async (id: string, image?: string) => {
        const data = getDraft(id);
        if (data) {
            if (image) {
                data.preview = image;
            }
            try {
                const res = await this.props.dataManager.saveDashboard(data);
                removeDraft(id);
                return res.id;
            } catch (e) {
                console.error(e);
            }
        }
    };

    // Loop through all combinations of multiple arrays
    // https://stackoverflow.com/questions/12152409/find-all-combinations-of-options-in-a-loop
    lazyProduct = (sets, f) => {
        const p: any[] = [], max = sets.length - 1, lens: number[] = [];
        for (let i = sets.length; i--;) lens[i] = sets[i].length;
        const dive = (d) => {
            const a = sets[d], len = lens[d];
            if (d == max) {
                for (let i = 0; i < len; ++i) {
                    p[d] = a[i]
                    f.apply(this, p)
                }
            } else {
                for (let i = 0; i < len; ++i) {
                    p[d] = a[i]
                    dive(d + 1);
                }
            }
            p.pop();
        }
        dive(0);
    }


    /**
     * to dispatch data for different plots (based on block id)
     * @param block the block
     * @returns the fetched data from API with timeseries
     */
    blockData = (block: BlockModel) => {

        if (block.blockType === "text") {
            return []
        }

        const config: ConfigurationModel | any = block.config;
        const metaData: BlockDataModel = config.metaData;
        const data: any[] = [];
        const missingData: any[] = [];

        if (
            this.state.filtersId.every((filter_id) => metaData.filters[filter_id])
        ) {
            // Go through all combinations and check that there is no missing data
            this.lazyProduct(
                this.state.filtersId.map((filter_id) => metaData.filters[filter_id]),
                (...filter_combo) => {
                    const d = this.state.plotData.find(
                        (e) => {
                            // example: e.region==filter_combo[region] && e.variable==filter_combo[variable]
                            for (const [idx, filter_id] of this.state.filtersId.entries()) {
                                const filter_id_singular = FILTERS_DEFINITION[filter_id]["id_singular"]
                                if (e[filter_id_singular] !== filter_combo[idx]){
                                    return false
                                }
                            }
                            return true
                        }
                    );
                    if (d) {
                        data.push(d);
                    } else {
                        const temp = {}
                        for (const [idx, filter_id] of this.state.filtersId.entries()){
                            const filter_id_singular = FILTERS_DEFINITION[filter_id]["id_singular"]
                            temp[filter_id_singular]=filter_combo[idx]
                        }
                        missingData.push(temp);
                    }
                }
            );
        }

        if (missingData.length > 0) {
            this.retreiveAllTimeSeriesData(missingData);
        }

        return data;
    };

    /**
     * If dashboard is draft, get first all the possible data to visualize
     * This function called one time on draft dashboard rendered
     */
    getPlotData = (blocks: BlockModel[]) => {
        const data: any[] = [];
        Object.values(blocks).forEach((block: any) => {
            const metaData: BlockDataModel = {...block.config.metaData};

            // get all possible data from controlled blocks
            const controlBlock = getControlBlock(blocks, block.controlBlock);
            if (controlBlock) {
                const config = controlBlock.config as ConfigurationModel;
                this.filtersId.forEach(filter_id => {
                    if (config.metaData.master[filter_id].isMaster) {
                        metaData[filter_id] = config.metaData[filter_id];
                    }
                })
            }

            // Check if the block type != text
            if (
                this.state.filtersId.every((filter_id) => metaData.filters[filter_id])
            ) {
                // Go through all combinations and check that there is no missing data
                this.lazyProduct(
                    this.state.filtersId.map((filter_id) => metaData.filters[filter_id]),
                    (...filter_combo) => {
                        const temp = {}
                        for (const [idx, filter_id] of this.state.filtersId.entries()){
                            const filter_id_singular = FILTERS_DEFINITION[filter_id]["id_singular"]
                            temp[filter_id_singular]=filter_combo[idx]
                        }
                        data.push(temp);
                    }
                );
            }
        });

        this.retreiveAllTimeSeriesData(data);
    };

    retreiveAllTimeSeriesData = (data) => {
        this.props.dataManager.fetchPlotData(data)
            .then(res => {
                    this.setState({plotData: [...this.state.plotData, ...res]});
                }
            );
    }

    /**
     * Set the first filtered data (By data focus)
     * @param dashboard the current dashboard
     * @param selectedFilter dashboard selected filter
     */
    updateFilterByDataFocus = (dashboard: DashboardModel, selectedFilter) => {
        if (selectedFilter !== '' && this.state.isFetchData) {
            const data = {...this.state.filterByDataFocus};
            data[selectedFilter] = dashboard.dataStructure[selectedFilter].selection;
            this.filtersId.forEach((filterId) => {
                if (filterId !== selectedFilter) {
                    data[selectedFilter].forEach((filterValue) => {
                        data[filterId] = Array.from(
                            new Set([
                                ...data[filterId],
                                ...this.state.filters[selectedFilter][filterValue][filterId],
                            ])
                        );
                    });
                }
            });
            this.setState({filterByDataFocus: data});
        }
    }

    render() {
        const {readonly} = this.props;
        return readonly ? (
            <ReadOnlyDashboard
                shareButtonOnClickHandler={() => Utils.copyToClipboard()}
                blockData={this.blockData}
                filtersId={this.filtersId}
                {...this.props}
            />
        ) : (
            (this.state.isFetchData && <DashboardSelectionControl
                saveData={this.saveData}
                filters={this.state.filters}
                plotData={this.state.plotData}
                blockData={this.blockData}
                getPlotData={this.getPlotData}
                updateFilterByDataFocus={this.updateFilterByDataFocus}
                filterByDataFocus={this.state.filterByDataFocus}
                filtersId={this.filtersId}
                {...this.props}
            />) || <div className="dashboard">
                <Spin className="centered"/>
            </div>

            // TODO handle error
        );
    }
}

export default withDataManager(DashboardDataConfiguration);
