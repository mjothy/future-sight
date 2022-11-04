import { Component, createRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import BlockViewManager from './blocks/BlockViewManager';
import PropTypes from 'prop-types';
import { EditTwoTone, DragOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const ResponsiveGridLayout = WidthProvider(Responsive);
const GRID_RATIO = 16/9
const COLS = 12
/**
 * Manage react grid layout
 */
class DashboardConfigView extends Component<any, any> {
  static propTypes = {
    layout: PropTypes.arrayOf(PropTypes.object),
    updateLayout: PropTypes.func,
    updateSelectedBlock: PropTypes.func,
    readonly: PropTypes.bool
  };

  static defaultProps = {
    readonly: false
  }

  /**
   * Array of references of all blocks on LayoutGrid
   */
  private readonly ref: any[];

  private width = 300;
  private height = 200;

  constructor(props) {
    super(props);
    this.ref = [];

    this.state = {
      graphsSize: [],
      rowHeight: 30
    };
  }

  gridRef = createRef();

  componentDidMount() {
    // Adjust the width and height of the graph in case the blocks already exist
    this.updateAllLayoutsView();

    // Update graph dim after every resize
    window.addEventListener('resize', this.updateAllLayoutsView);

    // Define initial height
    const node : WidthProvider = this.gridRef.current;
    if (node.constructor.name ==  "WidthProvider") {
      this.setState({ rowHeight: node.state.width/COLS/GRID_RATIO});
    }

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
   * @param layout the update layouts
   */
  onLayoutChange = (layout) => {
    if (!this.props.readonly) {
      this.props.updateLayout(layout);
      this.updateAllLayoutsView();
    }
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
    graphsSize[layout.i] = {
      width: this.ref[key].clientWidth,
      height: this.ref[key].clientHeight,
    };
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

  onBlockClick = (e, id) => {
    e.preventDefault();
    if (id) {
      this.props.updateSelectedBlock(id);
    }
  };

  onWidthChange = (width, margin, cols, containerPadding) => {
  //  Update height to keep grid ratio to 16/9
    this.setState({rowHeight: width/cols/GRID_RATIO});
  }

  render() {
    const { blocks, layout } = this.props;
    return (
      <ResponsiveGridLayout
        className="dashboard-grid"
        ref={this.gridRef}
        id="ResponsiveGridLayout"
        layouts={{ lg: layout }}
        isDraggable={!this.props.readonly}
        isResizable={!this.props.readonly}
        breakpoints={{ lg: 1, md: 0, sm: 0, xs: 0, xxs: 0 }}
        cols={{ lg: COLS, md: COLS, sm: COLS, xs: COLS, xxs: COLS }}
        rowHeight={this.state.rowHeight}
        onLayoutChange={this.onLayoutChange}
        onBreakpointChange={this.onBreakpointChange}
        onResizeStop={this.resizeStop}
        draggableHandle={".block-grab"}
        onWidthChange={this.onWidthChange}
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
            >
              {!this.props.readonly && (
                <div className="block-edit" style={{ position: "fixed", top: 2, right: 2, zIndex: 2 }}>
                  <Button icon={<EditTwoTone />} onClick={(e) => this.onBlockClick(e, layout.i)} />
                </div>
              )}
              {!this.props.readonly && (
                <div 
                  className="block-grab"
                  style={{
                    position: "fixed",
                    top: 2,
                    left: 2,
                    zIndex: 2
                  }}>
                  <Button size="small" icon={<DragOutlined />} />
                </div>
              )}
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
