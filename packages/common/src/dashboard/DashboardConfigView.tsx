/* eslint-disable react/prop-types */
import React, { Component } from "react";
import { Responsive, WidthProvider } from 'react-grid-layout';
import Block from "./blocks/Block";

// Responsibility: return all the blocks added by user

const ResponsiveGridLayout = WidthProvider(Responsive);

class DashboardConfigView extends Component<any, any> {
  handleBreakPointChange = breakpoint => {
    this.props.setBreakPoint(breakpoint);
  };

  render() {
    const { data, layouts } = this.props;
    console.log("data: ", data);
    console.log("layouts: ", layouts);

    return (
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        autoSize={true}
        isDraggable={true}
        isResizable={true}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      >
        {Object.keys(data).map(item => <div key={item}>
          <Block data={data[item]} />
        </div>)}

      </ResponsiveGridLayout>
    )
  }
}


export default DashboardConfigView;