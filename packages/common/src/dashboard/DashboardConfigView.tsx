import { Component } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import BlockViewManager from './blocks/views/BlockViewManager';
import PropTypes from 'prop-types';

const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Manage react grid layout
 */
class DashboardConfigView extends Component<any, any> {
  static propTypes = {
    layout: PropTypes.arrayOf(PropTypes.object),
    updateLayout: PropTypes.func,
    updateSelectedBlock: PropTypes.func,
  };

  /**
   * Array of references of all blocks on LayoutGrid
   */
  private ref: any[];

  private width = 300;
  private height = 200;

  constructor(props) {
    super(props);
    this.ref = [];

    this.state = {
      graphsSize: [],
    };
  }

  componentDidMount() {
    // Adjust the width and height of the graph in case the blocks already exist
    this.updateAllLayoutsView();

    // Update graph dim after every resize
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
  onBreakpointChange = (newBreakPoint, newCols) => {
    this.updateAllLayoutsView();
  };

  /**
   * Callback with new layouts
   * @param layouts the update layouts
   */
  onLayoutChange = (layout) => {
    this.props.updateLayout(layout);
    this.updateAllLayoutsView();
  };

  /**
   * Calls when resize is complete
   * @param e The update layouts (returns an array of all layouts in the GridLayoutView)
   * @param layout current updated layout
   */
  resizeStop = (e, layout) => {
    this.updateLayoutView(layout);
  };

  /**
   * Update {width,height} of layout item content
   * @param layout
   */
  updateLayoutView = (layout) => {
    const key = layout.i;
    const graphsSize = this.state.graphsSize;
    const obj = {
      width: this.ref[key].clientWidth,
      height: this.ref[key].clientHeight,
    };
    graphsSize[layout.i] = obj;
    this.setState({ graphsSize });
  };

  /**
   * Update {width,height} of all blocks content on every block dimentions change
   */
  updateAllLayoutsView = () => {
    const layout = this.props.layout;
    layout.map((layout) => {
      this.updateLayoutView(layout);
    });
  };

  onBlockClick = (e) => {
    if (e.currentTarget.id) this.props.updateSelectedBlock(e.currentTarget.id);
    else alert('No block selected !');
  };

  render() {
    const { blocks, layout } = this.props;
    return (
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        autoSize={true}
        isDraggable={true}
        isResizable={true}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={50}
        maxRows={12}
        onLayoutChange={this.onLayoutChange}
        onBreakpointChange={this.onBreakpointChange}
        onResizeStop={this.resizeStop}
      >
        {layout.map((layout) => (
          <div
            key={layout.i}
            className={
              blocks[this.props.blockSelectedId]?.blockType === 'data'
                ? this.props.blockSelectedId === layout.i
                  ? 'selected-layout'
                  : blocks[this.props.blockSelectedId]?.controlBlock ===
                    layout.i
                  ? 'selected-layout-master'
                  : ''
                : this.props.blockSelectedId === layout.i
                ? 'selected-layout'
                : blocks[layout.i]?.controlBlock ===
                    this.props.blockSelectedId &&
                  blocks[layout.i]?.controlBlock !== ''
                ? 'selected-layout-master'
                : ''
            }
          >
            <div
              ref={(ref) => (this.ref[layout.i] = ref)}
              id={layout.i}
              className={'width-100 height-100 bg-white'}
              onDoubleClick={this.onBlockClick}
            >
              <BlockViewManager
                {...this.props}
                currentBlock={...blocks[layout.i]}
                width={
                  this.state.graphsSize[layout.i]
                    ? this.state.graphsSize[layout.i].width
                    : this.width
                }
                height={
                  this.state.graphsSize[layout.i]
                    ? this.state.graphsSize[layout.i].height
                    : this.height
                }
              />
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    );
  }
}

export default DashboardConfigView;
