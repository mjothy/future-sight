import {
  BlockDataModel,
  BlockModel,
  ColorizerProvider,
  ComponentPropsWithDataManager,
  ConfigurationModel,
  DataModel,
  PlotDataModel,
  ReadOnlyDashboard,
  Colorizer,
  OptionsDataModel
} from '@future-sight/common';
import {Component} from 'react';
import withDataManager from '../../services/withDataManager';
import {RoutingProps} from '../app/Routing';
import DashboardSelectionControl from './DashboardSelectionControl';
import {getDraft, removeDraft} from '../drafts/DraftUtils';
import Utils from '../../services/Utils';
import {Spin} from 'antd';
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
      allData: new OptionsDataModel(),
      /**
       * Data (with timeseries from IASA API)
       */
      allPlotData: {},
      plotData: {},
      isFetchData: false
    };
  }

  async componentDidMount() {
    const allData = this.state.allData;
    try {
      allData['regions'] = await this.props.dataManager.fetchRegions();
      allData['variables'] = await this.props.dataManager.fetchVariables();
      allData['models'] = await this.props.dataManager.fetchModels();
      allData['scenarios'] = await this.props.dataManager.fetchScenarios();
      allData['categories'] = await this.props.dataManager.fetchCategories();
      this.setState({ allData, isFetchData: true });
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
  blockData = (block: BlockModel): void => {
    if (block.blockType === "text") {
      return
    }

    const config: ConfigurationModel | any = block.config;
    const metaData: BlockDataModel = config.metaData;
    const data: PlotDataModel[] = [];
    const missingData: DataModel[] = [];

    // TODO add categories
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
              if (metaData.versions[model]
                  && metaData.versions[model][scenario]
                  && metaData.versions[model][scenario].length>0
              ){
                for (const version of metaData.versions[model][scenario]){
                  const d = this.state.allPlotData[block.id]?.find(
                      (e) =>
                          e.model === model &&
                          e.scenario === scenario &&
                          e.variable === variable &&
                          e.region === region &&
                          e.version === version
                  );
                  if (d) {
                    data.push(d);
                  } else {
                    missingData.push({model, scenario, variable, region, version});
                  }
                }
              } else {
                const d = this.state.allPlotData[block.id]?.find(
                    (e) =>
                        e.model === model &&
                        e.scenario === scenario &&
                        e.variable === variable &&
                        e.region === region
                );
                if (d) {
                  data.push(d);
                } else {
                  missingData.push({model, scenario, variable, region});
                }
              }
            });
          });
        });
      });
    }

    if (missingData.length > 0) {
      this.retreiveAllTimeSeriesData(data, missingData, block.id);
    } else {
      const plotData = JSON.parse(JSON.stringify(this.state.plotData))
      plotData[block.id] = [...data]
      this.setState({ plotData: plotData })
    }
  };

  retreiveAllTimeSeriesData = (data, missingData, blockId) => {
    this.props.dataManager.fetchPlotData(missingData)
      .then(res => {
        if (res.length > 0) {
          const allPlotData = JSON.parse(JSON.stringify(this.state.allPlotData))
          if (allPlotData[blockId] != undefined){
            allPlotData[blockId].push(res)
          } else {
            allPlotData[blockId] = [...res]
          }
          const plotData = JSON.parse(JSON.stringify(this.state.plotData))
          plotData[blockId] = [...data, ...res]
          this.setState({ allPlotData: allPlotData, plotData: plotData })
        }
      });
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
        allData={this.state.allData}
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
