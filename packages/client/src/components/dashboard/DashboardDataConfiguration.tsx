import {
  ComponentPropsWithDataManager,
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

  /**
   * Add the { model, scenario } selected by the user to the state
   * @param selection the dashboard dataStructure
   */
  // setDashboardModelScenario = (selection) => {
  //   const modelScenarios: any[] = [];
  //   console.log('selection: ', selection);
  //   Object.keys(selection).forEach((model) => {
  //     Object.keys(selection[model]).forEach((scenario) => {
  //       modelScenarios.push({ model, scenario });
  //     });
  //   });

  //   this.setState({ dashboardModelScenario: modelScenarios });
  // };

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
        {...this.props}
      />
    ) : (
      <DashboardSelectionControl
        saveData={this.saveData}
        filters={this.state.filters}
        setPlotData={this.setPlotData}
        plotData={this.state.plotData}
        {...this.props}
      />
    );
  }
}

export default withDataManager(DashboardDataConfiguration);
