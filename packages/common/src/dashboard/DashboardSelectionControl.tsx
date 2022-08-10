import React, { Component } from 'react'
import DashboardModel from '../models/DashboardModel';
import Dashboard from './Dashboard'

export default class DashboardSelectionControl extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      sidebarVisible: false,
      dashboardId: "",

      /**
       * layout (lg) on the dashboard view
       */
      layout: [],

      /**
       * Blocks
      */
      blocks: {
      },
      /**
       * The selected block id
       */
      blockSelectedId: "",
      click: 0,
      blockType: ""
    }
  }

  updateLayout = (layout) => {
    this.setState({ layout });
  }

  updateSelectedBlock = (blockSelectedId) => {
    this.setState({ blockSelectedId });
  }

  updateBlockData = (data) => {
    const dashboardData = this.state.blocks;
    dashboardData[this.state.blockSelectedId].visualizeData = data;
    this.setState({ blocks: dashboardData });
  }

  addBlock = (blockType: string, masterBlockId?: string) => {
    console.log("block type: ", blockType);
    const block = {
      w: 4,
      h: 2,
      x: 0,
      y: 0,
      i: "graph" + this.state.click
    };
    let dash = new DashboardModel();
    dash = this.state.blocks;
    console.log("dash: ", dash);
    console.log("dash id: ", dash.id);

    const blocks = this.state.blocks;

    blocks[block.i] = { blockType, visualizeData: [] }
    const state = {
      blocks,
      layout: [block, ...this.state.layout],
      blockSelectedId: block.i,
      click: this.state.click + 1,
    };

    if (masterBlockId)
    blocks[block.i].masterBlocks = masterBlockId;

    this.setState(state);
  }

  render() {
    return (
      <Dashboard
        addBlock={this.addBlock}
        blockSelectedId={this.state.blockSelectedId}
        layout={this.state.layout}
        updateLayout={this.updateLayout}
        blocks={this.state.blocks}
        updateSelectedBlock={this.updateSelectedBlock}
        updateBlockData={this.updateBlockData}
        {...this.props} />
    )
  }
}
