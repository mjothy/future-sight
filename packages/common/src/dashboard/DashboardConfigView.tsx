/* eslint-disable react/prop-types */
import React, { Component } from "react";
import { Responsive, WidthProvider } from 'react-grid-layout';
import Block from "./blocks/Block";

// Responsibility: return all the blocks added by user

const ResponsiveGridLayout = WidthProvider(Responsive);

class DashboardConfigView extends Component<any, any> {

  constructor(props){
    super(props);
    this.handleBreakPointChange = this.handleBreakPointChange.bind(this);
    this.layoutChanged = this.layoutChanged.bind(self);
  }

  handleBreakPointChange = (breakpoint, cols) => {
    console.log("here!", breakpoint);
    console.log("here! cols", cols);

  };


  layoutChanged = (layouts) => {
    console.log("enter here layoutsChanged");
    console.log("Layouts: ", layouts);
    }

  render() {
    const { data, layouts } = this.props;
    return (
      <ResponsiveGridLayout
        className="layout"
        layouts={{lg: layouts}}
        autoSize={true}
        isDraggable={true}
        isResizable={true}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        onBreakpointChange = {this.handleBreakPointChange}
        onLayoutChange={this.layoutChanged}
        >
        {Object.keys(data).map(item => <div key={item}>
          <Block data={data[item]} />
        </div>)}

      </ResponsiveGridLayout>
    )
  }
}


export default DashboardConfigView;