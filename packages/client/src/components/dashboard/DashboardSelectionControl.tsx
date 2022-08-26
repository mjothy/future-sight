import { BlockModel, DashboardModel, DataModel, LayoutModel } from '@future-sight/common';
import React, { Component } from 'react';
import { v1 as uuidv1 } from 'uuid';

import { DashboardDataConfigurationProps } from './DashboardDataConfiguration';
import DashboardView from './DashboardView';

export interface DashboardSelectionControlProps
  extends DashboardDataConfigurationProps {
  getData: (data: DataModel[]) => any[];
  saveData: () => void;
}

export default class DashboardSelectionControl extends Component<
  any,
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
    // check if dashboard is draft (exist in localStorage)
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
  }

  updateBlockMetaData = (data, idBlock = "") => {
    const dashboard = this.state.dashboard;
    // store the selected data
    let blockSelectedId = "";
    if (this.state.blockSelectedId === "") {
      blockSelectedId = idBlock;
    } else {
      blockSelectedId = this.state.blockSelectedId;

    }
    let metaData = dashboard.blocks[blockSelectedId].config.metaData;
    metaData = { ...metaData, ...data };
    dashboard.blocks[blockSelectedId].config.metaData = metaData;
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
      dashboard.blocks[layoutItem.i].controlBlock = masterBlockId;

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
        saveDashboard={this.props.saveData}
        updateDashboardMetadata={this.updateDashboardMetadata}
        {...this.props}
      />
    );
  }
}
