import React, { Component } from 'react'
import DashboardConfigView from './DashboardConfigView';
import DashboardConfigControl from './DashboardConfigControl';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import Sidebar from './sidebar/Sidebar';

export default class Dashboard extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      sidebarVisible: false,
      layouts: [],
      data: {},
      blockSelectedId: "",
      click: 0,
      type: ""
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0)
  }

  buildLayouts = (layout, data) => {
    this.setState({ layouts: [layout, ...this.state.layouts], data: { ...data }, blockSelectedId: layout.i });
  }

  unselectBlock() {
    console.log("call unselected");
    this.setState({ blockSelectedId: "" });
  }

  updateLayouts = (layouts) => {
    this.setState({ layouts });
  }

  addBlock = (type) => {
    console.log("add block, ", type)
    this.props.dataManager.fetchData().then(data => this.setState({ data }, () => {
      const layout = {
        w: 4,
        h: 2,
        x: 0,
        y: 0,
        i: "graph" + this.state.click
      };
      const key = "graph" + this.state.click;
      const data1 = {}
      data[0].type = type;
      this.buildLayouts(layout, data1);
      this.setState({ click: this.state.click + 1, type });
    }))
  }

  render() {
    const setVisibility = () => {
      this.setState({
        sidebarVisible: !this.state.sidebarVisible
      })
    }

    return (

      <div className='dashboard'>
        <Sidebar visible={this.state.sidebarVisible} {...this.props} >
          <DashboardConfigControl {...this.props} buildLayouts={this.buildLayouts} blockSelectedId={this.state.blockSelectedId} unselectBlock={this.unselectBlock.bind(this)}
            addBlock={this.addBlock} type={this.state.type} />
        </Sidebar>
        <div className="dashboard-content">
          <div>
            {React.createElement(this.state.sidebarVisible ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setVisibility(),
            })}
          </div>
          <DashboardConfigView data={this.state.data} layouts={this.state.layouts} updateLayouts={this.updateLayouts} type={this.state.type} />
        </div>
      </div>
    )
  }
}