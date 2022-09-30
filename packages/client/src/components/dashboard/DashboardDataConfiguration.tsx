import {
  ComponentPropsWithDataManager,
  DataModel,
  ReadOnlyDashboard,
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
      filters: {
        regions: {},
        variables: {},
        scenarios: {},
        models: {},
      },
      dashboardModelScenario: [],
    };
  }

  componentDidMount(): void {
    this.props.dataManager.fetchRegions().then((regions) => {
      console.log("fetched regions: ", regions);
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

  /**
   * Compare each { model, scenario } in a and b
   * @param a the first array of { model, scenario }
   * @param b the second array of { model, scenario }
   * @returns whether a and b contain the same objects
   */
  modelScenarioIsEqual = (a: any[], b: any[]) => {
    if (a.length != b.length) {
      return false;
    }
    let i = 0; // a and b should keep the objects order
    while (i < a.length) {
      if (a[i].model !== b[i].model && a[i].scenario !== b[i].scenario) {
        return false;
      }
      i++;
    }
    return true;
  };

  componentDidUpdate(
    prevProps: Readonly<DashboardDataConfigurationProps>,
    prevState: Readonly<any>,
    snapshot?: any
  ): void {
    console.log("update: ");
    const shouldUpdate = !this.modelScenarioIsEqual(
      prevState.dashboardModelScenario,
      this.state.dashboardModelScenario
    ); // A child updated the models and scenarios selected
    if (shouldUpdate) {
      this.fetchData();
    }
  }

  /**
   * Add the { model, scenario } selected by the user to the state
   * @param selection the dashboard dataStructure
   */
  setDashboardModelScenario = (selection) => {
    const modelScenarios: any[] = [];
    console.log('selection: ', selection);
    Object.keys(selection).forEach((model) => {
      Object.keys(selection[model]).forEach((scenario) => {
        modelScenarios.push({ model, scenario });
      });
    });

    this.setState({ dashboardModelScenario: modelScenarios });
  };

  /**
   * Fetch the data missing from the state
   */
  fetchData = async () => {
    try {
      /**
       * Find modelScenario in the state.data
       * @param modelScenario the { model, scenario } to find
       * @returns the object wrapping the data related to the modelScenario, or null if the modelScenario was not found
       */
      const findModelScenario = (modelScenario) => {
        console.log("modelScenario: ", modelScenario);
        const element = this.state.data.find(
          (dataElement) =>
            dataElement.model === modelScenario.model &&
            dataElement.scenario === modelScenario.scenario
        );
        return element ? element : null;
      };

      const missingData = this.state.dashboardModelScenario.filter(
        (modelScenario) => {
          return findModelScenario(modelScenario) === null;
        }
      );
      const res = await this.props.dataManager.fetchPlotData(missingData);
      this.setState((prev) => {
        return { data: prev.data.concat(res) };
      });
    } catch (e) {
      console.error(e);
    }
  };

  /**
   *
   * @param data [{model, scenario, variable, region}]
   * @returns the fetched data from API with timeseries
   */
  getData = (data: DataModel[]) => {
    return this.settingPlotData(data);
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

  settingPlotData(data: DataModel[] = []) {
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
        getData={this.getData}
        setDashboardModelScenario={this.setDashboardModelScenario}
        {...this.props}
      />
    ) : (
      <DashboardSelectionControl
        getData={this.getData}
        saveData={this.saveData}
        setDashboardModelScenario={this.setDashboardModelScenario}
        filters={this.state.filters}
        {...this.props}
      />
    );
  }
}

export default withDataManager(DashboardDataConfiguration);
