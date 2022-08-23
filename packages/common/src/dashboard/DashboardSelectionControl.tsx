import React, { Component } from 'react';
import { v1 as uuidv1 } from 'uuid';
import BlockModel from '../models/BlockModel';

import DashboardModel from '../models/DashboardModel';
import DataModel from '../models/DataModel';
import LayoutModel from '../models/LayoutModel';
import Dashboard from './Dashboard';
import { DashboardDataConfigurationProps } from './DashboardDataConfiguration';

export interface DashboardSelectionControlProps
  extends DashboardDataConfigurationProps {
  getData: (data: DataModel[]) => any[];
}

export default class DashboardSelectionControl extends Component<
  DashboardSelectionControlProps,
  any
> {
  constructor(props) {
    super(props);
    this.state = {
      dashboard: new DashboardModel(uuidv1()),
      sidebarVisible: false,

      /**
       * The selected block id
       */
      blockSelectedId: '',
      click: 0,
      blockType: '',
    };
  }

  componentDidMount() {
    const dashboard = this.state.dashboard;
    dashboard.dataStructure = this.props.structureData;
    dashboard.userData = this.props.userData;
    this.setState({ dashboard });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // if (prevState.dashboard !== this.state.dashboard) {
    // const str = JSON.stringify(this.state.dashboard);
    // this.props.dataManager.addDashboard(str);
    // }
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

  updateBlockMetaData = (data) => {
    const dashboard = this.state.dashboard;
    // store the selected data
    let metaData = dashboard.blocks[this.state.blockSelectedId].config.metaData;
    metaData = { ...metaData, ...data };
    dashboard.blocks[this.state.blockSelectedId].config.metaData = metaData;
    this.setState({
      dashboard: { ...this.state.dashboard, blocks: dashboard.blocks },
    });
  };

  updateBlockStyleConfig = (data) => {
    const dashboard = this.state.dashboard;
    dashboard.blocks[this.state.blockSelectedId].config.configStyle = data;
    this.setState({
      dashboard
    });
  }

  addBlock = (blockType: string, masterBlockId?: string) => {
    const layoutItem = new LayoutModel('block' + this.state.click);
    const dashboard = this.state.dashboard;

    dashboard.blocks[layoutItem.i] = new BlockModel(layoutItem.i, blockType);
    dashboard.layout = [layoutItem, ...dashboard.layout];

    if (masterBlockId)
      dashboard.blocks[layoutItem.i].masterBlocks = masterBlockId;

    const state = {
      dashboard: {
        ...this.state.dashboard,
        blocks: dashboard.blocks,
        layout: dashboard.layout,
      },
      blockSelectedId: layoutItem.i,
      click: this.state.click + 1,
    };
    this.setState(state);
  };

  render() {
    return (
      <Dashboard
        dashboard={this.state.dashboard}
        addBlock={this.addBlock}
        blockSelectedId={this.state.blockSelectedId}
        layout={this.state.dashboard.layout}
        updateLayout={this.updateLayout}
        blocks={this.state.dashboard.blocks}
        updateSelectedBlock={this.updateSelectedBlock}
        updateBlockMetaData={this.updateBlockMetaData}
        updateBlockStyleConfig={this.updateBlockStyleConfig}
        {...this.props}
      />
    );
  }
}
