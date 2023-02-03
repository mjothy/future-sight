import {
  BlockDataModel,
  BlockModel, ColorizerProvider,
  ComponentPropsWithDataManager,
  ConfigurationModel, DataModel,
  getBlock,
  ReadOnlyDashboard, Colorizer
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

const dataFilterKeys = ["model", "scenario", "variable", "region"]

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
      /**
       * Data (with timeseries from IASA API)
       */
      plotData: {},
      isFetchData: false,
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
                const d = this.state.plotData[block.id]?.find(
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
        this.retreiveAllTimeSeriesData(missingData, block.id);
      }
      return data;
    }

    return [];
  };

  retreiveAllTimeSeriesData = (data, blockId) => {
    this.props.dataManager.fetchPlotData(data)
      .then(res => {
        const plotData = { ...this.state.plotData }
        if (plotData[blockId] != undefined)
          plotData[blockId] = [...plotData[blockId], ...res]
        else
          plotData[blockId] = [...res]

        if (res.length > 0) {
          console.log("res: ", res)
          this.setState({ plotData });
        }
        // else {
        //   this.setState({ plotData });
        // }
      }
      );
  }

  render() {
    const { readonly } = this.props;

    const toRender = (readonly ? (
      <ReadOnlyDashboard
        shareButtonOnClickHandler={() => Utils.copyToClipboard()}
        embedButtonOnClickHandler={() => Utils.copyToClipboard(undefined, "&embedded")}
        blockData={this.blockData}
        optionsLabel={this.optionsLabel}
        plotData={this.state.plotData}
        {...this.props}
      />
    ) : (
      (this.state.isFetchData && <DashboardSelectionControl
        saveData={this.saveData}
        filters={this.state.filters}
        plotData={this.state.plotData}
        blockData={this.blockData}
        optionsLabel={this.optionsLabel}
        {...this.props}
      />) || <div className="dashboard">
        <Spin className="centered" />
      </div>)
        // TODO handle error
    )

    return (
        <ColorizerProvider colorizer={new Colorizer(dataFilterKeys, undefined, undefined, "region")}>
          {toRender}
        </ColorizerProvider>
    )
  }
}

export default withDataManager(DashboardDataConfiguration);
