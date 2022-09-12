import {
  BlockModel,
  ComponentPropsWithDataManager,
  DashboardModel,
  DataModel,
  LayoutModel,
} from '@future-sight/common';
import { Component } from 'react';
import { v1 as uuidv1 } from 'uuid';
import { RoutingProps } from '../app/Routing';

import DashboardView from './DashboardView';
import {getDraft, setDraft} from "../drafts/DraftUtils";
import { Spin } from 'antd';

export interface DashboardSelectionControlProps
  extends ComponentPropsWithDataManager,
    RoutingProps {
  getData: (data: DataModel[]) => any[];
  saveData: (id: string) => Promise<any>;
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
      nextId: 0,
      blockType: '',
      isDraft: false,
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
        this.setState({ dashboard: dashboardJson });
        // get last block id
        let lastId = "0"
        if (dashboardJson.blocks.length > 0) {
          lastId = Object.keys(dashboardJson.blocks).pop() as string;
        }
        // If dashboard already created (in draft), show directly the dashboard view
        this.setState({
          isDraft: true,
          nextId: (parseInt(lastId) + 1).toString(),
        });
      } else {
        console.error("no draft found with id" + id)
      }
    }
  }

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

  updateDashboardMetadata = (data) => {
    this.setState({ dashboard: { ...this.state.dashboard, ...data } });
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
    const layoutItem = new LayoutModel(this.state.nextId.toString());
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
      nextId: this.state.nextId + 1,
    };
    this.setState(state);
  };

  deleteBlock = (blockId: string) => {
    const blocks = this.state.dashboard.blocks;
    delete blocks[blockId]
    const layout = this.state.dashboard.layout;
    const index = layout.findIndex((element) => element.i === blockId);
    layout.splice(index, 1);
    this.setState({
      dashboard: {
        ...this.state.dashboard,
        blocks: blocks,
        layout: layout,
      },
      blockSelectedId: ""
    })
  }

  saveData = async (callback?: () => void) => {
    const { id } = this.state.dashboard;
    await this.props.saveData(id);
    if (callback) {
      callback();
    }
  };

  render() {
    if (!this.state.dashboard) {
      return <div className="dashboard"><Spin className="centered"/></div>
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
        {...this.props}
      />
    );
  }
}
