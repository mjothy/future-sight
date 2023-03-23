import {
  BlockDataModel,
  BlockModel, ColorizerProvider,
  ComponentPropsWithDataManager,
  ConfigurationModel,
  ReadOnlyDashboard, Colorizer
} from '@future-sight/common';
import { Component } from 'react';
import withDataManager from '../../services/withDataManager';
import { RoutingProps } from '../app/Routing';
import DashboardSelectionControl from './DashboardSelectionControl';
import { getDraft, removeDraft } from '../drafts/DraftUtils';
import Utils from '../../services/Utils';
import { Spin } from 'antd';
import * as _ from 'lodash';

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
      response: [],
      blockId: ""
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

  componentDidUpdate(prevProps: Readonly<DashboardDataConfigurationProps>, prevState: Readonly<any>, snapshot?: any): void {
    if (!_.isEqual(this.state.response, prevState.response)) {
      const plotData = JSON.parse(JSON.stringify(this.state.plotData))
      if (plotData[this.state.updateBlockId] != undefined)
        plotData[this.state.updateBlockId].push(...this.state.response)
      else
        plotData[this.state.updateBlockId] = [...this.state.response]

      this.setState({ plotData })
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

    if (block.blockType !== "text" && block.blockType !== "control") {
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
        if (res.length > 0) {
          this.setState({ response: res, updateBlockId: blockId });
        }
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
