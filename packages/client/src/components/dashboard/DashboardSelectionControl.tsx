import {
  BlockModel,
  blocksIdToDelete,
  compareDataStructure,
  ComponentPropsWithDataManager,
  ConfigurationModel,
  DashboardModel,
  getSelectedFilter,
  LayoutModel,
} from '@future-sight/common';
import { Component } from 'react';
import { RoutingProps } from '../app/Routing';

import DashboardView from './DashboardView';
import { getDraft, setDraft } from '../drafts/DraftUtils';
import { notification, Spin } from 'antd';

export interface DashboardSelectionControlProps
  extends ComponentPropsWithDataManager,
  RoutingProps {
  saveData: (id: string, image?: string) => Promise<any>;
  filters: any;
  plotData: any[];
  blockData: (block: BlockModel) => any[];
  updateFilterByDataFocus: (dashboard: DashboardModel, filtre: string) => void;
  filtreByDataFocus: any;
  optionsLabel: string[];
}

export default class DashboardSelectionControl extends Component<
  DashboardSelectionControlProps,
  any
> {
  constructor(props) {
    super(props);
    this.state = this.initialize()
  }

  initialize() {
    // Check first if dashboard in draft
    const state = {
      dashboard: {},
      /**
       * The selected block id
       */
      blockSelectedId: '',
      currentSelectedBlock: null,
      isDraft: false,
    };
    const w_location = window.location.pathname;
    if (w_location.includes('draft')) {
      const locationSearch = window.location.search;
      const params = new URLSearchParams(locationSearch);
      const id = params.get('id');
      const dashboardJson: any = getDraft(id);
      if (dashboardJson) {
        state.dashboard = dashboardJson;
        state.isDraft = true;
      } else {
        console.error('no draft found with id' + id);
      }

    }

    return state;
  }

  componentDidMount(): void {
    if (this.state.dashboard != undefined) {
      const selectedFilter = getSelectedFilter(this.state.dashboard.dataStructure);
      this.props.updateFilterByDataFocus(this.state.dashboard, selectedFilter);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dashboard != this.state.dashboard || prevState.currentSelectedBlock != this.state.currentSelectedBlock) {
      setDraft(this.state.dashboard.id, this.state.dashboard);
    }
  }

  getLastId = () => {
    const dashboardJson = this.state.dashboard;
    let lastId = 0;
    if (Object.keys(dashboardJson.blocks).length > 0) {
      lastId = Math.max(...Object.keys(dashboardJson.blocks).map((key => parseInt(key))));
    }
    return lastId;
  };

  updateSelectedBlock = (blockSelectedId: string) => {
    const currentSelectedBlock = this.state.dashboard.blocks[blockSelectedId];
    this.setState({ blockSelectedId, currentSelectedBlock });
  };

  updateDashboard = (dashboard: DashboardModel) => {
    const isUpdateDataStructure = compareDataStructure(this.state.dashboard.dataStructure, dashboard.dataStructure);
    if (isUpdateDataStructure) {
      // Update dataStructure (Data focus)
      const newDataStructure = dashboard.dataStructure;
      const toDeleteBlocks = blocksIdToDelete(Object.values(this.state.dashboard.blocks), newDataStructure);
      const selectedFilter = getSelectedFilter(newDataStructure);
      const blockAndLayouts = this.deleteBlocks(Array.from(toDeleteBlocks));
      dashboard = { ...dashboard, ...blockAndLayouts }
      this.setState({ dashboard }, () => {
        this.props.updateFilterByDataFocus(this.state.dashboard, selectedFilter);
      });
    } else {
      if (this.state.blockSelectedId != '') {
        const currentSelectedBlock = { ...dashboard.blocks[this.state.blockSelectedId] };
        const currentDashboard = this.state.dashboard;
        if (dashboard.blocks[this.state.blockSelectedId] != undefined) {
          currentDashboard.blocks[this.state.blockSelectedId].config = { ...dashboard.blocks[this.state.blockSelectedId].config };
        }
        currentDashboard.layout = dashboard.layout;
        this.setState({ dashboard: currentDashboard, currentSelectedBlock })
      } else {
        this.setState({ dashboard })
      }
    }
  }

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
      blockSelectedId: layoutItem.i
    };
    this.setState(state);
  };

  deleteBlocks = (blocksId: string[]) => {
    const blocks = { ...this.state.dashboard.blocks };
    let layout = [...this.state.dashboard.layout];
    blocksId.forEach(blockId => {

      // delete childs
      if (blocks[blockId] !== undefined && blocks[blockId].blockType === "control") {
        const blockChilds = Object.values(blocks).filter((block: BlockModel | any) => block.controlBlock === blockId).map((block: BlockModel | any) => block.id);
        blockChilds.forEach(id => {
          delete blocks[id];
          layout = layout.filter((element) => element.i !== id);
        });
      }

      delete blocks[blockId]
      layout = layout.filter((element) => element.i !== blockId);

    })

    this.setState({ blockSelectedId: '' })

    const blocksAndLayouts = {
      blocks: blocks,
      layout: layout,
    }

    return blocksAndLayouts;
  };

  saveData = async (callback?: (idPermanent) => void, image?: string) => {
    const { id } = this.state.dashboard;
    const idPermanent = await this.props.saveData(id, image);
    if (callback) {
      callback(idPermanent);
    }
  };

  /**
  * Check if data in selection (selected data) are present in Select options
  */
  checkIfSelectedInOptions = (optionsData, block: BlockModel) => {
    const optionsLabel = this.props.optionsLabel;
    const dashboard = { ...this.state.dashboard };
    const config = block.config as ConfigurationModel;
    let isDashboardUpdated = false;
    const missingData = {}
    optionsLabel.forEach(option => {
      // Check if selected data (metaData[option]) are in options of drop down list
      const dataInOptionsData = config.metaData[option].filter(data => optionsData[option].includes(data));
      missingData[option] = config.metaData[option].filter(data => !optionsData[option].includes(data));
      if (dataInOptionsData.length < config.metaData[option].length) {
        isDashboardUpdated = true;
        config.metaData[option] = dataInOptionsData;
        if (config.metaData[option].length === 0) {
          config.metaData.selectOrder = config.metaData.selectOrder.filter(option1 => option1 !== option);
        }
        dashboard.blocks[block.id as string].config = { ...config };
      }
    });

    if (isDashboardUpdated) {
      this.updateDashboard(dashboard);
      notification.warning({
        message: 'Data missing in selection box',
        description: (<div dangerouslySetInnerHTML={{ __html: this.notifDesc(missingData) }}></div>),
        placement: 'bottomRight',
      });
    }
  }

  notifDesc = (missingData) => {
    console.log("missingData: ", missingData);
    let notif = "Some selected data are not available in existing options: <br/>";
    Object.keys(missingData).forEach(key => {
      if (missingData[key].length > 0) {
        let msg = '';
        missingData[key].forEach(value => {
          msg = msg + value + ', ';
        })

        notif = notif + key + ': ' + msg + '<br/>';
      }
    })

    return notif;
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
        updateSelectedBlock={this.updateSelectedBlock}
        updateDashboard={this.updateDashboard}
        saveDashboard={this.saveData}
        deleteBlocks={this.deleteBlocks}
        checkIfSelectedInOptions={this.checkIfSelectedInOptions}
        isDraft={this.state.isDraft}
        currentSelectedBlock={this.state.currentSelectedBlock}
        {...this.props}
      />
    );
  }
}
