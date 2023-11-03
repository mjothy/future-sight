import {
  BlockDataModel,
  BlockModel,
  Colorizer,
  ColorizerProvider,
  ComponentPropsWithDataManager,
  ConfigurationModel,
  DataModel,
  OptionsDataModel,
  PlotDataModel,
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
      filters: {},
      allData: new OptionsDataModel(),
      /**
       * Data (with timeseries from IASA API)
       */
      allPlotData: {},
      missingData: {},
      plotData: {},
      loadingControlBlock: {

      }
    };
  }

  saveData = async (id: string, username: string, password: string, image?: string) => {
    const data = getDraft(id);
    if (data) {
      if (image) {
        data.preview = image;
      }
      try {
        const res = await this.props.dataManager.saveDashboard(data, username, password);
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
  blockData = async (block: BlockModel, childBlocks?: BlockModel[]) => {
    switch (block.blockType) {
      case "data":
        return this.getPlotData(block);
      case "control":
        if (childBlocks != null && childBlocks.length > 0) {
          for (const child of childBlocks) {
            await this.getPlotData(child);
          }
        }
        return
    }
  };

  getPlotData = (block: BlockModel) => {
    const config: ConfigurationModel | any = block.config;
    const metaData: BlockDataModel = config.metaData;
    const data: PlotDataModel[] = [];
    const missingData: DataModel[] = [];
    // Check if type == control --> fin setState
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
                && metaData.versions[model][scenario].length > 0
              ) {
                for (const version of metaData.versions[model][scenario]) {
                  const d = this.state.allPlotData[block.id]?.find(
                    (e: PlotDataModel) =>
                      e.model === model &&
                      e.scenario === scenario &&
                      e.variable === variable &&
                      e.region === region &&
                      e.run.id === version.id
                  );
                  if (d) {
                    data.push(d);
                  } else {

                    if (version == null) {
                      console.log("debug 1: ", this.state.missingData);
                      console.log("debug 2: ", block);
                    }
                    const noNeedToFetch = this.state.missingData[block.id]?.find(
                      (e: PlotDataModel) =>
                        e.model === model &&
                        e.scenario === scenario &&
                        e.variable === variable &&
                        e.region === region &&
                        e.run?.id === version.id
                    );
                    if (noNeedToFetch == null) {
                      missingData.push({ model, scenario, variable, region, run: version });
                    }
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
                  const noNeedToFetch = this.state.missingData[block.id]?.find(
                    (e: PlotDataModel) =>
                      e.model === model &&
                      e.scenario === scenario &&
                      e.variable === variable &&
                      e.region === region
                  );
                  if (noNeedToFetch == null) {
                    missingData.push({ model, scenario, variable, region });
                  }
                }
              }
            });
          });
        });
      });
    }

    if (missingData.length > 0) {
      return this.retreiveAllTimeSeriesData(data, missingData, block.id);
    } else {
      const plotData = JSON.parse(JSON.stringify(this.state.plotData))
      plotData[block.id] = [...data]
      return new Promise<void>((resolve) => this.setState({ plotData: plotData }, resolve))
    }
  };

  updateLoadingControlBlock = (id, status) => {
    return new Promise<void>((resolve) => {
      const loadingControlBlock = { ...this.state.loadingControlBlock };
      loadingControlBlock[id] = status;
      this.setState({ loadingControlBlock }, () => {
        resolve();
      });
    });
  };

  retreiveAllTimeSeriesData = (data: PlotDataModel[], missingData: DataModel[], blockId) => {
    return this.props.dataManager.fetchPlotData(missingData)
      .then(res => {
        const missingDataState = { ... this.state.missingData };
        // no new data to add to state.allPLotData, only update state.plotData
        if (res.length == 0) {
          const plotData = JSON.parse(JSON.stringify(this.state.plotData))
          plotData[blockId] = data
          if (missingDataState[blockId] != undefined) {
            missingDataState[blockId].push(...missingData)
          } else {
            missingDataState[blockId] = [...missingData]
          }
          this.setState({ plotData: plotData, missingData: missingDataState })
          return
        }

        if (res.length < missingData.length) {
          const unfetchedData = missingData.filter(element => !res.find(
            (e: PlotDataModel) =>
              e.model === element.model &&
              e.scenario === element.scenario &&
              e.variable === element.variable &&
              e.region === element.region &&
              e.run?.id === element.run?.id
          ))

          if (missingDataState[blockId] != undefined) {
            missingDataState[blockId].push(...unfetchedData)
          } else {
            missingDataState[blockId] = [...unfetchedData]
          }
        }

        const allPlotData = JSON.parse(JSON.stringify(this.state.allPlotData))
        if (allPlotData[blockId] != undefined) {
          allPlotData[blockId].push(...res)
        } else {
          allPlotData[blockId] = [...res]
        }
        const plotData = JSON.parse(JSON.stringify(this.state.plotData))
        plotData[blockId] = [...data, ...res]
        this.setState({ allPlotData: allPlotData, plotData: plotData, missingData: missingDataState })

      }).catch(err => {
        console.log("TODO Handle error: ", err);
      });
  }

  render() {
    const { readonly } = this.props;

    const toRender = (readonly ? (
      <ReadOnlyDashboard
        shareButtonOnClickHandler={() => Utils.copyToClipboard()}
        embedButtonOnClickHandler={() => Utils.copyToClipboard(undefined, "&embedded")}
        blockData={this.blockData}
        // filters={this.state.filters}
        plotData={this.state.plotData}
        optionsLabel={this.optionsLabel}
        updateLoadingControlBlock={this.updateLoadingControlBlock}
        loadingControlBlock={this.state.loadingControlBlock}
        {...this.props}
      />
    ) : (
      <DashboardSelectionControl
        saveData={this.saveData}
        allData={this.state.allData}
        plotData={this.state.plotData}
        blockData={this.blockData}
        optionsLabel={this.optionsLabel}
        updateLoadingControlBlock={this.updateLoadingControlBlock}
        loadingControlBlock={this.state.loadingControlBlock}
        {...this.props}
      /> || <div className="dashboard">
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
