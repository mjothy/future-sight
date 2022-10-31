import {
  BlockDataModel,
  BlockModel,
  ComponentPropsWithDataManager,
  ConfigurationModel,
  ReadOnlyDashboard,
} from '@future-sight/common';
import { Component } from 'react';
import withDataManager from '../../services/withDataManager';
import { RoutingProps } from '../app/Routing';
import DashboardSelectionControl from './DashboardSelectionControl';
import { getDraft, removeDraft } from '../drafts/DraftUtils';
import Utils from '../../services/Utils';

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
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        regions: {},
        variables: {},
        scenarios: {},
        models: {},
      },
      dashboardModelScenario: [],
      /**
       * Data (with timeseries from IASA API)
       */
      plotData: []
    };
  }

  componentDidMount(): void {
    this.props.dataManager.fetchRegions().then((regions) => {
      this.setState({
        filters: { ...this.state.filters, regions }
      })
    }
    );
    this.props.dataManager.fetchVariables().then((variables) =>
      this.setState({
        filters: { ...this.state.filters, variables }

      })
    );
    this.props.dataManager.fetchScenarios().then((scenarios) =>
      this.setState({
        filters: { ...this.state.filters, scenarios }
      })
    );
    this.props.dataManager.fetchModels().then((models) =>
      this.setState({
        filters: { ...this.state.filters, models }
      })
    );
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
        this.setPlotData(missingData);
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
      const metaData: BlockDataModel = block.config.metaData;
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
    this.setPlotData(data);
  };

  setPlotData = (data) => {
    this.props.dataManager.fetchPlotData(data)
      .then(res => {
        this.setState({ plotData: [...this.state.plotData, ...res] });
      }
      );
  }

  render() {
    const { readonly } = this.props;

    return readonly ? (
      <ReadOnlyDashboard
        shareButtonOnClickHandler={() => Utils.copyToClipboard()}
        blockData={this.blockData}
        {...this.props}
      />
    ) : (
      <DashboardSelectionControl
        saveData={this.saveData}
        filters={this.state.filters}
        setPlotData={this.setPlotData}
        plotData={this.state.plotData}
        blockData={this.blockData}
        getPlotData={this.getPlotData}
        {...this.props}
      />
    );
  }
}

export default withDataManager(DashboardDataConfiguration);
