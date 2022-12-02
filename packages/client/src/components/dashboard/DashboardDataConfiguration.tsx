import {
  BlockDataModel,
  BlockModel,
  ComponentPropsWithDataManager,
  ConfigurationModel,
  getBlock,
  ReadOnlyDashboard,
} from '@future-sight/common';
import { Component } from 'react';
import withDataManager from '../../services/withDataManager';
import { RoutingProps } from '../app/Routing';
import DashboardSelectionControl from './DashboardSelectionControl';
import { getDraft, removeDraft } from '../drafts/DraftUtils';
import Utils from '../../services/Utils';
import { Spin } from 'antd';

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
  optionsLabel: string[] = [];
  constructor(props) {
    super(props);
    this.optionsLabel = this.props.dataManager.getOptions();
    this.state = {
      filters: {
        regions: {},
        variables: {},
        scenarios: {},
        models: {},
      },
      filtreByDataFocus: {
        regions: [],
        variables: [],
        scenarios: [],
        models: [],
      },
      /**
       * Data (with timeseries from IASA API)
       */
      plotData: [],
      isFetchData: false
    };
  }

  async componentDidMount() {
    const filters = this.state.filters;
    try {
      filters['regions'] = await this.props.dataManager.fetchRegions();
      filters['variables'] = await this.props.dataManager.fetchVariables();
      filters['models'] = await this.props.dataManager.fetchModels();
      filters['scenarios'] = await this.props.dataManager.fetchScenarios();
      this.setState({ filters, isFetchData: true });
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

  /**
   * to dispatch data for diffrenet plots (based on block id)
   * @param block the block
   * @returns the fetched data from API with timeseries
   */
  blockData = (block: BlockModel) => {

    if (block.blockType !== "text") {
      const config: ConfigurationModel | any = block.config;
      const metaData: BlockDataModel = config.metaData;
      const data: any[] = [];
      const missingData: any[] = [];

      if (
        metaData.models &&
        metaData.scenarios &&
        metaData.variables &&
        metaData.regions
      ) {
        metaData.models.forEach((model) => {
          metaData.scenarios.forEach((scenario) => {
            metaData.variables.forEach((variable) => {
              metaData.regions.forEach((region) => {
                const d = this.state.plotData.find(
                  (e) =>
                    e.model === model &&
                    e.scenario === scenario &&
                    e.variable === variable &&
                    e.region === region
                );
                if (d) {
                  data.push(d);
                } else {
                  missingData.push({ model, scenario, variable, region });
                }
              });
            });
          });
        });
      }

      if (missingData.length > 0) {
        this.retreiveAllTimeSeriesData(missingData);
      }
      return data;
    }

    return [];
  };

  /**
   * If dashboard is draft, get first all the possible data to visualize
   * This function called one time on draft dashboard rendered
   */
  getPlotData = (blocks: BlockModel[]) => {
    const data: any[] = [];
    Object.values(blocks).forEach((block: any) => {
      const metaData: BlockDataModel = { ...block.config.metaData };

      // get all possible data from controlled blocks
      const controlBlock = getBlock(blocks, block.controlBlock);
      if (controlBlock.id !== '') {
        const config = controlBlock.config as ConfigurationModel;
        this.optionsLabel.forEach(option => {
          if (config.metaData.master[option].isMaster) {
            metaData[option] = config.metaData[option];
          }
        })
      }

      // Check if the block type != text
      if (
        metaData !== undefined &&
        metaData.models &&
        metaData.scenarios &&
        metaData.variables &&
        metaData.regions
      ) {
        metaData.models.forEach((model) => {
          metaData.scenarios.forEach((scenario) => {
            metaData.variables.forEach((variable) => {
              metaData.regions.forEach((region) => {
                data.push({ model, scenario, variable, region });
              });
            });
          });
        });
      }
    });
    this.retreiveAllTimeSeriesData(data);
  };

  retreiveAllTimeSeriesData = (data) => {
    this.props.dataManager.fetchPlotData(data)
      .then(res => {
        this.setState({ plotData: [...this.state.plotData, ...res] });
      }
      );
  }

  /**
   * Set the first filtered data (By data focus)
   * @param dashboard the current dashboard
   * @param selectedFilter dashboard selected filter
   */
  updateFilterByDataFocus = (dashboard, selectedFilter) => {
    if (selectedFilter !== '' && this.state.isFetchData) {
      const data = this.state.filtreByDataFocus;
      data[selectedFilter] = dashboard.dataStructure[selectedFilter].selection;
      this.optionsLabel.forEach((option) => {
        if (option !== selectedFilter) {
          data[selectedFilter].forEach((filterValue) => {
            data[option] = Array.from(
              new Set([
                ...data[option],
                ...this.state.filters[selectedFilter][filterValue][option],
              ])
            );
          });
        }
      });
      this.setState({ filtreByDataFocus: data });
    }
  }

  render() {
    const { readonly } = this.props;
    return readonly ? (
      <ReadOnlyDashboard
        shareButtonOnClickHandler={() => Utils.copyToClipboard()}
        blockData={this.blockData}
        optionsLabel={this.optionsLabel}
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
        filtreByDataFocus={this.state.filtreByDataFocus}
        optionsLabel={this.optionsLabel}
        {...this.props}
      />) || <div className="dashboard">
        <Spin className="centered" />
      </div>

      // TODO handle error 
    );
  }
}

export default withDataManager(DashboardDataConfiguration);
