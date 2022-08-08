import React, { Component } from 'react'
import Dashboard from './Dashboard'

export default class DashboardSelectionControl extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      sidebarVisible: false,
      layouts: [],
      data: {
      },
      blockSelectedId: "",
      click: 0,
      blockType: ""
    }
  }

  buildLayouts = (layout) => {
    this.setState({ layouts: [layout, ...this.state.layouts], blockSelectedId: layout.i });
  }

  unselectBlock() {
    this.setState({ blockSelectedId: "" });
  }

  updateLayouts = (layouts) => {
    this.setState({ layouts });
  }

  addBlock = (blockType) => {
    this.props.dataManager.fetchData().then(data => {
      const layout = {
        w: 4,
        h: 2,
        x: 0,
        y: 0,
        i: "graph" + this.state.click
      };
      this.buildLayouts(layout);
      const dataPlot = this.state.data;
      // add after plotType
      dataPlot[layout.i] = {blockType: blockType, visualizeData: data }
      this.setState({ click: this.state.click + 1, blockType,data: dataPlot});
    })
  }

  render() {
    return (
      <Dashboard 
        addBlock={this.addBlock}
        buildLayouts={this.buildLayouts}
        blockSelectedId={this.state.blockSelectedId}
        unselectBlock={this.unselectBlock.bind(this)}
        blockType={this.state.blockType}
        layouts={this.state.layouts}
        updateLayouts={this.updateLayouts}
        data={this.state.data}
        {...this.props} />
    )
  }
}
