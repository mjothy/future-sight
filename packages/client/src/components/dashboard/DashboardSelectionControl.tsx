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

export interface DashboardSelectionControlProps
  extends ComponentPropsWithDataManager,
    RoutingProps {
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
      isDraft: false,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.dashboard != this.state.dashboard) {
      localStorage.setItem(
        this.state.dashboard.id,
        JSON.stringify(this.state.dashboard)
      );
    }
  }

  componentDidMount() {
    // Check first if dashboard in draft
    let isDashboardDraft = false;
    const w_location = window.location.pathname;
    if (w_location.includes('draft')) {
      const locationSearch = window.location.search;
      const params = new URLSearchParams(locationSearch);
      const id = params.get('id');

      Object.keys(localStorage).map((key) => {
        if (key === id) {
          const dashboardString = localStorage.getItem(key) as string;
          const dashboard = JSON.parse(dashboardString);
          this.setState({ dashboard });
          isDashboardDraft = true;
          // get last block id
          const lastId = Object.keys(dashboard.blocks).pop() as string;
          // If dashboard already created (in draft), show directly the dashboard view
          this.setState({
            isDraft: true,
            click: (parseInt(lastId) + 1).toString(),
          });
        }
      });

      if (!isDashboardDraft)
        localStorage.setItem(
          this.state.dashboard.id,
          JSON.stringify(this.state.dashboard)
        );
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
   * @param data Block confi metaData
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
      dashboard: { ...this.state.dashboard, blocks: dashboard.blocks },
    });
  };

  addBlock = (blockType: string, masterBlockId?: string) => {
    const layoutItem = new LayoutModel(this.state.click.toString());
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
        isDraft={this.state.isDraft}
        {...this.props}
      />
    );
  }
}
