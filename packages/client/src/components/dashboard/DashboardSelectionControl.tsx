import {
  BlockModel,
  ComponentPropsWithDataManager,
  DashboardModel,
  getSelectedFilter,
  LayoutModel,
} from '@future-sight/common';
import { Component } from 'react';
import { RoutingProps } from '../app/Routing';

import DashboardView from './DashboardView';
import { getDraft, setDraft } from '../drafts/DraftUtils';
import { Spin } from 'antd';

export interface DashboardSelectionControlProps
  extends ComponentPropsWithDataManager,
  RoutingProps {
  saveData: (id: string, image?: string) => Promise<any>;
  filters: any;
  setPlotData: (data: any[]) => void;
  plotData: any[];
  blockData: (block: BlockModel) => any[];
  getPlotData: (blocks: BlockModel[]) => void;
  updateFilterByDataFocus: (dashboard: DashboardModel, filtre: string) => void;
  filtreByDataFocus: any;
  options: string[]
}

export default class DashboardSelectionControl extends Component<
  DashboardSelectionControlProps,
  any
> {
  constructor(props) {
    super(props);
    this.state = {
      dashboard: undefined,
      /**
       * The selected block id
       */
      blockSelectedId: '',
      isDraft: false,
      plotData: [],
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dashboard != this.state.dashboard) {
      setDraft(this.state.dashboard.id, this.state.dashboard);
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
        this.setState(
          {
            dashboard: dashboardJson,
            isDraft: true,
          },
          () => {
            // Get the data for graphs
            this.props.getPlotData(this.state.dashboard.blocks);
            const selectedFilter = getSelectedFilter(this.state.dashboard.dataStructure);
            this.props.updateFilterByDataFocus(this.state.dashboard, selectedFilter);
          }
        );
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

  // TODO delecte to remplace by updateDashboard
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

  // TODO delecte to remplace by updateDashboard
  updateDashboardMetadata = (data) => {
    if (data.dataStructure === undefined) {
      this.setState({ dashboard: { ...this.state.dashboard, ...data } });
    } else {
      const selectedFilter = getSelectedFilter(data.dataStructure);
      // Update dataStructure (Data focus)      
      const newDataStructure = data.dataStructure;
      const toDeleteBlocks = new Set<string>();
      Object.values(this.state.dashboard.blocks).forEach((block: BlockModel | any) => {
        if (block.blockType !== "text") {
          block.config.metaData[selectedFilter].forEach(value => {
            if (!newDataStructure[selectedFilter].selection.includes(value)) {
              toDeleteBlocks.add(block.id);
            }
          })
        }
      });
      console.log("toDelete: ", toDeleteBlocks);
      this.setState({ dashboard: { ...this.state.dashboard, ...data } }, () => {
        this.deleteBlocks(Array.from(toDeleteBlocks));
        this.props.updateFilterByDataFocus(this.state.dashboard, selectedFilter);
      });
    }
  }
  /**
   * Update configuration metaData (selected models and scenarios)
   * @param data Block config metaData
   * @param idBlock In case of controling dataBlocks by controlBlock (so the control block is not necessarily selected, we need mandatory the id of controlBlock)
   */
  updateBlockMetaData = (data, idBlock) => {
    const dashboard = this.state.dashboard;
    // store the selected data
    const selectedBlock = dashboard.blocks[idBlock];
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

  // TODO delecte to remplace by updateDashboard
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
      const master = dashboard.blocks[masterBlockId].config.metaData.master;
      Object.keys(master).forEach((option) => {
        if (master[option].isMaster) {
          dashboard.blocks[layoutItem.i].config.metaData.selectOrder =
            Array.from(
              new Set([
                ...dashboard.blocks[layoutItem.i].config.metaData.selectOrder,
                option,
              ])
            );
          dashboard.blocks[layoutItem.i].config.metaData[option] =
            master[option].values;
        }
      });
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

  deleteBlocks = (blocksId: string[]) => {
    const blocks = { ...this.state.dashboard.blocks };
    let layout = [...this.state.dashboard.layout];
    blocksId.forEach(blockId => {

      layout = layout.filter((element) => element.i !== blockId);

      // delete childs
      if (blocks[blockId] !== undefined && blocks[blockId].blockType === "control") {
        const blockChilds = Object.values(blocks).filter((block: BlockModel | any) => block.controlBlock === blocks[blockId].id).map((block: BlockModel | any) => block.id);
        blockChilds.forEach(id => {
          delete blocks[id];
          layout = layout.filter((element) => element.i !== blockId);
        });
      }

      delete blocks[blockId]

    })

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
        updateLayout={this.updateLayout}
        updateSelectedBlock={this.updateSelectedBlock}
        updateBlockMetaData={this.updateBlockMetaData}
        updateBlockStyleConfig={this.updateBlockStyleConfig}
        saveDashboard={this.saveData}
        updateDashboardMetadata={this.updateDashboardMetadata}
        deleteBlocks={this.deleteBlocks}
        isDraft={this.state.isDraft}
        {...this.props}
      />
    );
  }
}
