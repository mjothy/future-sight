import React, { Component } from "react";
import { Responsive, WidthProvider } from 'react-grid-layout';
import BlockViewManager from "./blocks/views/BlockViewManager";
import PropTypes from 'prop-types';

const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Manage react grid layout
 */
class DashboardConfigView extends Component<any, any> {

  static propTypes = {
    layouts: PropTypes.arrayOf(PropTypes.object),
    updateLayouts: PropTypes.func,
    updateSelectedBlock: PropTypes.func
  }

  /**
   * Array of references of all blocks on LayoutGrid
   */
  private ref: any[];

  constructor(props) {
    super(props);
    this.ref = [];

    this.state = {
      width: 200,
      height: 200,
      graphsSize: [],
      currentLayouts: this.props.layouts
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateAllLayoutsView);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateAllLayoutsView);
  }

  /**
   * Calls back with breakpoint and new cols
   * @param newBreakPoint 
   * @param newCols 
   */
  onBreakpointChange(newBreakPoint, newCols) {
    this.updateAllLayoutsView();
  }

  /**
   * Callback with new layouts
   * @param layouts the update layouts
   */
  onLayoutChange = (layouts) => {
    this.props.updateLayouts(layouts);
    this.setState({ currentLayouts: layouts }, () => this.updateAllLayoutsView())
  }

  /**
   * Calls when resize is complete
   * @param e The update layouts (returns an array of all layouts in the GridLayoutView)
   * @param layout current updated layout
   */
  resizeStop = (e, layout) => {
    this.updateLayoutView(layout);
  }

  /**
   * Update {width,height} of layout item content
   * @param layout 
   */
  updateLayoutView = (layout) => {
    const key = layout.i;
    const graphsSize = this.state.graphsSize;
    const obj = {
      width: this.ref[key].clientWidth,
      height: this.ref[key].clientHeight
    }
    graphsSize[layout.i] = obj;
    this.setState({ graphsSize });
  }

  /**
   * Update {width,height} of all layout items content
   */
  updateAllLayoutsView = () => {
    this.state.currentLayouts.map(layout => {
      this.updateLayoutView(layout);
    });
  }

  onBlockClick = e => {
    console.log("Block: ", e.currentTarget.id);
    if (e.currentTarget.id)
      this.props.updateSelectedBlock(e.currentTarget.id);
    else alert("No block selected !");
  };

  render() {
    const { data, layouts } = this.props;
    return (
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layouts }}
        autoSize={true}
        isDraggable={true}
        isResizable={true}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={100}
        onLayoutChange={this.onLayoutChange.bind(this)}
        onBreakpointChange={this.onBreakpointChange.bind(this)}
        onResizeStop={this.resizeStop.bind(this)}
        onCli
      >
        {layouts.map(layout => <div key={layout.i} className={this.props.blockSelectedId === layout.i ? "selected-layout" : ""} >
          <div ref={ref => this.ref[layout.i] = ref} id={layout.i} className={"width-100 height-100"} onClick={this.onBlockClick.bind(this)}>
            <BlockViewManager  {...this.props} data={...data[layout.i]} width={this.state.graphsSize[layout.i] ? this.state.graphsSize[layout.i].width : 300} height={this.state.graphsSize[layout.i] ? this.state.graphsSize[layout.i].height : 300} />
          </div>
        </div>)}

      </ResponsiveGridLayout>
    )
  }
}

export default DashboardConfigView;