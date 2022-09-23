import {
  ComponentPropsWithDataManager,
  DataModel,
  ReadOnlyDashboard,
  DataModelSet,
} from '@future-sight/common';
import { Component } from 'react';
import withDataManager from '../../services/withDataManager';
import { RoutingProps } from '../app/Routing';
import DashboardSelectionControl from './DashboardSelectionControl';
import { getDraft, removeDraft } from '../drafts/DraftUtils';

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
      /**
       * Data (with timeseries from IASA API)
       */
      data: [],
      dashboardModelScenario: [],
    };
  }

  /**
   * Fetch the dataModels, if any
   * @param dataModels the missing DataModels to fetch
   */
  fetchData = async (dataModels: DataModel[]) => {
    if (dataModels.length > 0) {
      try {
        const res = await this.props.dataManager.fetchData(dataModels);
        this.setState((prev) => {
          return { data: prev.data.concat(res) };
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  /**
   * Get the DataModels from the dashboard
   * @param dashboard the user's dashboard
   */
  getDataModels = (dashboard) => {
    const dataModels = new DataModelSet();
    Object.values(dashboard.blocks).forEach((block: any) => {
      const metaData = block.config.metaData;
      Object.entries(metaData.models).forEach(([model, scenarios]) => {
        (scenarios as string[]).forEach((scenario) => {
          metaData.regions.forEach((region) => {
            metaData.variables.forEach((variable) => {
              dataModels.add({ model, scenario, region, variable });
            });
          });
        });
      });
    });
    return [...dataModels];
  };

  /**
   * Find the DataModels that are not in the state
   * @param dataModels the DataModels in the dashboard
   * @returns the list of DataModels for which there's no data in the state
   */
  findMissingData = (dataModels: DataModel[]) => {
    const { data: globalData } = this.state;
    return dataModels.filter((data) => {
      return !globalData.find(
        (gData) =>
          data.model === gData.model &&
          data.scenario === gData.scenario &&
          data.variable === gData.variable &&
          data.region === gData.region
      );
    });
  };

  /**
   * Look for missing data in the state for the dashboard's DataModels
   * @param dashboard
   */
  getDashboardData = (dashboard: any) => {
    const dataModels = this.getDataModels(dashboard);
    const missingData = this.findMissingData(dataModels);
    this.fetchData(missingData);
  };

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
   * @param data [{model, scenario, variable, region}]
   * @returns the fetched data from API with timeseries
   */
  settingPlotData = (data: DataModel[] = []) => {
    const plotData: any[] = [];
    data.map((dataElement) => {
      const existData = this.isDataExist(dataElement);
      if (existData !== null) plotData.push(existData);
    });

    return plotData;
  };

  /**
   * To limit requests to IASA API, we verify if we have already fetched the element
   * Check if this.data contains that element (already fetched by other block)
   * @param reqData
   * @returns Data element if it's exist (null if not)
   */
  isDataExist = (reqData: DataModel) => {
    const data = this.state.data;
    const element = data.find(
      (dataElement) =>
        dataElement.model === reqData.model &&
        dataElement.scenario === reqData.scenario &&
        dataElement.variable === reqData.variable &&
        dataElement.region === reqData.region
    );
    return element ? element : null;
  };

  render() {
    const { readonly } = this.props;

    return readonly ? (
      <ReadOnlyDashboard
        getData={this.settingPlotData}
        fetchData={this.getDashboardData}
        {...this.props}
      />
    ) : (
      <DashboardSelectionControl
        getData={this.settingPlotData}
        saveData={this.saveData}
        dashboardUpdated={this.getDashboardData}
        {...this.props}
      />
    );
  }
}

export default withDataManager(DashboardDataConfiguration);
