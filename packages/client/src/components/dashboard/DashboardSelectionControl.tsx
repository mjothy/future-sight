import {
  BlockModel,
  ComponentPropsWithDataManager,
  DataModel,
  LayoutModel,
} from '@future-sight/common';
import { Component } from 'react';
import { RoutingProps } from '../app/Routing';

import DashboardView from './DashboardView';
import { getDraft, setDraft } from '../drafts/DraftUtils';
import { Spin } from 'antd';
import BlockDataModel from '@future-sight/common/src/models/BlockDataModel';

export interface DashboardSelectionControlProps
  extends ComponentPropsWithDataManager,
  RoutingProps {
  saveData: (id: string, image?: string) => Promise<any>;
  filters: any;
  setPlotData: (data: any[]) => void
  plotData: any[];
}

export default class DashboardSelectionControl extends Component<
  DashboardSelectionControlProps,
  any
> {
  constructor(props) {
    super(props);
    this.state = {
      dashboard: undefined,
      sidebarVisible: false,

      /**
       * The selected block id
       */
      blockSelectedId: '',
      isDraft: false,
      selectedFilter: '',
      plotData: []
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dashboard != this.state.dashboard) {
      setDraft(this.state.dashboard.id, this.state.dashboard);
      if (this.state.dashboard) {
        // this.props.setDashboardModelScenario(
        //   this.state.dashboard.dataStructure
        // );
      }
    }
  }

  componentDidMount() {
    // Check first if dashboard in draft
    const w_location = window.location.pathname;
    if (w_location.includes('draft')) {
      const locationSearch = window.location.search;
      const params = new URLSearchParams(locationSearch);
      const id = params.get('id');
      const dashboardJson = getDraft(id);
      if (dashboardJson) {
        this.setState({
          dashboard: dashboardJson,
          isDraft: true,
        }, () => {
          // Get the data for graphs
          this.getPlotData();
        });

        // Get the selected filter(s)
        const filterOptions = Object.keys(dashboardJson.dataStructure)
          .filter((key) => dashboardJson.dataStructure[key].isFilter)
          .map((key) => key);
        if (filterOptions.length > 0) {
          this.updateSelectedFilter(filterOptions[0]);
        }

      } else {
        console.error('no draft found with id' + id);
      }
    }


  }

  getLastId = () => {
    const dashboardJson = this.state.dashboard;
    let lastId = 0;
    if (Object.keys(dashboardJson.blocks).length > 0) {
      lastId = Math.max(
        ...Object.keys(dashboardJson.blocks).map((key) => parseInt(key))
      );
    }
    return lastId;
  };

  updateLayout = (layout: LayoutModel[]) => {
    this.setState({
      dashboard: {
        ...this.state.dashboard,
        layout: layout,
      },
    });
  };

  updateSelectedBlock = (blockSelectedId: string) => {
    this.setState({ blockSelectedId });
  };

  updateDashboardMetadata = (data, deletion?: any) => {
    if (deletion) {
      //remove all blocks associated to deletion.model
      const blocks = this.state.dashboard.blocks;
      const layout = this.state.dashboard.layout;
      const toRemove: string[] = [];
      for (const blockId in blocks) {
        const block = blocks[blockId];
        if (deletion.model in block.config.metaData.models) {
          toRemove.push(blockId);
        }
      }
      for (const blockId of toRemove) {
        delete blocks[blockId];
        const index = layout.findIndex((element) => element.i === blockId);
        layout.splice(index, 1);
      }
      this.setState({
        dashboard: {
          ...this.state.dashboard,
          blocks: blocks,
          layout: layout,
          ...data,
        },
      });
    } else {
      this.setState({ dashboard: { ...this.state.dashboard, ...data } });
    }
  };

  /**
   * Update configuration metaData (selected models and scenarios)
   * @param data Block config metaData
   * @param idBlock In case of controling dataBlocks by controlBlock (so the control block is not necessarily selected, we need mandatory the id of controlBlock)
   */
  updateBlockMetaData = (data, idBlock = '') => {
    const dashboard = this.state.dashboard;
    // store the selected data
    let blockSelectedId = '';
    if (this.state.blockSelectedId === '') {
      blockSelectedId = idBlock;
    } else {
      blockSelectedId = this.state.blockSelectedId;
    }
    const selectedBlock = dashboard.blocks[blockSelectedId];
    if (selectedBlock.blockType === 'text') {
      selectedBlock.config = { value: data };
    } else {
      let metaData = selectedBlock.config.metaData;
      metaData = { ...metaData, ...data };
      selectedBlock.config.metaData = metaData;
    }
    this.setState({
      dashboard: { ...this.state.dashboard, blocks: dashboard.blocks },
    });
  };

  updateBlockStyleConfig = (data) => {
    const dashboard = this.state.dashboard;
    dashboard.blocks[this.state.blockSelectedId].config.configStyle = data;
    this.setState({
      dashboard: { ...this.state.dashboard, blocks: dashboard.blocks },
    });
  };

  addBlock = (blockType: string, masterBlockId?: string) => {
    const layoutItem = new LayoutModel((this.getLastId() + 1).toString());
    const dashboard = this.state.dashboard;

    dashboard.blocks[layoutItem.i] = new BlockModel(layoutItem.i, blockType);
    dashboard.layout = [layoutItem, ...dashboard.layout];

    if (masterBlockId) {
      dashboard.blocks[layoutItem.i].controlBlock = masterBlockId;
    }

    const state = {
      dashboard: {
        ...this.state.dashboard,
        blocks: dashboard.blocks,
        layout: dashboard.layout,
      },
      blockSelectedId: layoutItem.i,
    };
    this.setState(state);
  };

  deleteBlock = (blockId: string) => {
    const blocks = this.state.dashboard.blocks;
    delete blocks[blockId];
    const layout = this.state.dashboard.layout;
    const index = layout.findIndex((element) => element.i === blockId);
    layout.splice(index, 1);
    this.setState({
      dashboard: {
        ...this.state.dashboard,
        blocks: blocks,
        layout: layout,
      },
      blockSelectedId: '',
    });
  };

  saveData = async (callback?: (idPermanent) => void, image?: string) => {
    const { id } = this.state.dashboard;
    const idPermanent = await this.props.saveData(id, image);
    if (callback) {
      callback(idPermanent);
    }
  };

  updateSelectedFilter = (selectedFilter) => {
    this.setState({ selectedFilter });
  };

  /**
   * If dashboard is draft, get first all the possible data to visualize
   */
  //Change this function position (dashboard view ???)
  getPlotData = () => {
    const data: any[] = [];
    Object.values(this.state.dashboard.blocks).map((block: any) => {
      const metaData: BlockDataModel = block.config.metaData;
      if (metaData.models && metaData.scenarios && metaData.variables && metaData.regions) {
        metaData.models.map((model) => {
          metaData.scenarios.map((scenario) => {
            metaData.variables.map((variable) => {
              metaData.regions.map((region) => {
                data.push({ model, scenario, variable, region });
              });
            });
          });
        });
      }
    });
    console.log("first block metaData: ", data)
    this.props.setPlotData(data)
  }

  /**
   * to dispatch data for diffrenet plots (based on block id)
   * @param blockId the block id
   * @returns the fetched data from API with timeseries
   */
  blockData = (blockId: string) => {
    const block = this.state.dashboard.blocks[blockId];

    const metaData: BlockDataModel = block.config.metaData;
    // if the models is control, it will take the data from his master
    if (block.controlBlock !== '') {
      const controlBlock =
        this.state.dashboard.blocks[block.controlBlock].config.metaData;
      if (controlBlock.master['models'].isMaster)
        metaData.models = controlBlock.master['models'].values;
      if (controlBlock.master['scenarios'].isMaster)
        metaData.scenarios = controlBlock.master['scenarios'].values;
      if (controlBlock.master['variables'].isMaster)
        metaData.variables = controlBlock.master['variables'].values;
      if (controlBlock.master['regions'].isMaster)
        metaData.regions = controlBlock.master['regions'].values;
    }

    const data: any[] = [];
    const missingData: any[] = [];

    if (metaData.models && metaData.scenarios && metaData.variables && metaData.regions) {
      metaData.models.map((model) => {
        metaData.scenarios.map((scenario) => {
          metaData.variables.map((variable) => {
            metaData.regions.map((region) => {
              const d = this.props.plotData.find(
                (e) => e.model === model && e.scenario === scenario && e.variable === variable && e.region === region
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
      this.props.setPlotData(missingData);
    }
    return data;
  }


  render() {
    if (!this.state.dashboard) {
      return (
        <div className="dashboard">
          <Spin className="centered" />
        </div>
      );
    }
    return (
      <DashboardView
        dashboard={this.state.dashboard}
        addBlock={this.addBlock}
        blockSelectedId={this.state.blockSelectedId}
        layout={this.state.dashboard.layout}
        updateLayout={this.updateLayout}
        blocks={this.state.dashboard.blocks}
        updateSelectedBlock={this.updateSelectedBlock}
        updateBlockMetaData={this.updateBlockMetaData}
        updateBlockStyleConfig={this.updateBlockStyleConfig}
        saveDashboard={this.saveData}
        updateDashboardMetadata={this.updateDashboardMetadata}
        deleteBlock={this.deleteBlock}
        isDraft={this.state.isDraft}
        updateSelectedFilter={this.updateSelectedFilter}
        selectedFilter={this.state.selectedFilter}
        blockData={this.blockData}
        {...this.props}
      />
    );
  }
}
