import {
  ComponentPropsWithDataManager,
  DataModel,
  ReadOnlyDashboard,
} from '@future-sight/common';
import { Component } from 'react';
import withDataManager from '../../services/withDataManager';
import { RoutingProps } from '../app/Routing';
import DashboardSelectionControl from './DashboardSelectionControl';
import {getDraft, removeDraft} from "../drafts/DraftUtils";

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
    };
  }

  /**
   *
   * @param data [{model, scenario, variable, region}]
   * @returns the fetched data from API with timeseries
   */
  getData = (data: DataModel[]) => {
    data.map((dataElement) => {
      if (this.isDataExist(dataElement) === null) {
        this.props.dataManager.fetchData(dataElement).then((resData) => {
          // Check here if data exist or not (requested data)
          if (resData.length !== 0)
            this.setState({ data: [...this.state.data, resData] });
        });
      }
    });

    return this.settingPlotData(data);
  };

  saveData = async (id: string) => {
    const data = getDraft(id);
    if (data) {
      try {
        const res = await this.props.dataManager.saveDashboard(data);
        removeDraft(id)
        return res;
      } catch (e) {
        console.error(e);
      }
    }
  };

  settingPlotData(data: any[] = []) {
    const plotData: any[] = [];
    data.map((dataElement) => {
      const existData = this.isDataExist(dataElement);
      if (existData !== null) plotData.push(existData);
    });

    return plotData;
  }

  /**
   * To limit requests to IASA API, we verify if we have already fetched the element
   * Check if this.data contains that element (already fetched by other block)
   * @param reqData
   * @returns Data element if it's exist (null if not)
   */
  isDataExist = (reqData: DataModel) => {
    const data = this.state.data;
    let isExist = null;
    data.map((dataElement) => {
      if (
        dataElement.model === reqData.model &&
        dataElement.scenario === reqData.scenario &&
        dataElement.variable === reqData.variable &&
        dataElement.region === reqData.region
      ) {
        isExist = dataElement; //the data already exist
      }
    });
    return isExist;
  };

  render() {
    const { readonly } = this.props;

    return readonly ? (
      <ReadOnlyDashboard getData={this.getData} {...this.props} />
    ) : (
      <DashboardSelectionControl
        getData={this.getData}
        saveData={this.saveData}
        {...this.props}
      />
    );
  }
}

export default withDataManager(DashboardDataConfiguration);