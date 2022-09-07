import React, { Component } from 'react'
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
       * The config data of the new added bock
      */
      data: {
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
    const dashboardData = this.state.data;
    dashboardData[this.state.blockSelectedId].visualizeData = data;
    this.setState({ data: dashboardData });
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
    const data = this.state.data;
    data[block.i] = { blockType, visualizeData: [] }
    const state = {
      data,
      layout: [block, ...this.state.layout],
      blockSelectedId: block.i,
      click: this.state.click + 1,
    };

    if (masterBlockId)
      data[block.i].masterBlocks = masterBlockId;

    this.setState(state);
  }

  render() {
    return (
      <Dashboard
        addBlock={this.addBlock}
        blockSelectedId={this.state.blockSelectedId}
        layout={this.state.layout}
        updateLayout={this.updateLayout}
        data={this.state.data}
        updateSelectedBlock={this.updateSelectedBlock}
        updateBlockData={this.updateBlockData}
        {...this.props} />
    )
  }
}
