import { BlockModel, ComponentPropsWithDataManager, DashboardModel, DataModel, LayoutModel } from '@future-sight/common';
import { Component } from 'react';
import { v1 as uuidv1 } from 'uuid';
import { RoutingProps } from '../app/Routing';

import DashboardView from './DashboardView';

export interface DashboardSelectionControlProps
  extends ComponentPropsWithDataManager, RoutingProps {
  getData: (data: DataModel[]) => any[];
  saveData: () => void;
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dashboard != this.state.dashboard) {
      localStorage.setItem(this.state.dashboard.id, JSON.stringify(this.state.dashboard));
      const dashId = localStorage.getItem(this.state.dashboard.id);
    }
  }

  componentDidMount() {
    // the url contains /draft/id -> if the dashoard new, it will start by /draft -> create dashboard and redirect to /draft/id
    // check if dashboard is draft (exist in localStorage)
    // Check if draft mode (by the route)
    // check if the id exist in the route exist in localstrorage (if not published)
    // if exist setState of dashbpard
    // if not, create a new dashboard with new id and setState
    localStorage.setItem(this.state.dashboard.id, JSON.stringify(this.state.dashboard));
  }

  updateLayout = (layout: LayoutModel[]) => {
    this.setState({
      dashboard: {
        ...this.state.dashboard,
        layout: layout,
      },
    });
    // Update localStorage

  };

  updateSelectedBlock = (blockSelectedId: string) => {
    this.setState({ blockSelectedId });
  };

  updateDashboardMetadata = (data) => {
    this.setState({ dashboard: { ...this.state.dashboard, ...data } });
    // Update localStorage
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
    // Update localStorage

  };

  updateBlockStyleConfig = (data) => {
    const dashboard = this.state.dashboard;
    dashboard.blocks[this.state.blockSelectedId].config.configStyle = data;
    this.setState({
      dashboard: { ...this.state.dashboard, blocks: dashboard.blocks }
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
    // Update localStorage

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
