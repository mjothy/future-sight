import { Component } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import BlockViewManager from './blocks/BlockViewManager';
import PropTypes from 'prop-types';
import { EditTwoTone, DragOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';

const ResponsiveGridLayout = WidthProvider(Responsive);
const GRID_RATIO = 16 / 9
const COLS = 12
const INITIAL_ROW_HEIGHT = 1280 / COLS / GRID_RATIO

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
            graphsSize: {},
            rowHeight: INITIAL_ROW_HEIGHT,
            cols: COLS
        };
    }

    componentDidMount() {
        // Adjust the width and height of the graph in case the blocks already exist
        this.updateAllLayoutsView();

        const n_cols = this.getCols()
        this.setState({
            cols: n_cols,
            rowHeight: 1280 / n_cols / GRID_RATIO
        }
        )

        // Update graph dim after every resize
        window.addEventListener('resize', this.updateAllLayoutsView);
        setTimeout(
            () => {
                window.dispatchEvent(new Event('resize'));
            },
            1
        );

    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        // Update graphsize when rowheight is first updated
        if (prevState.rowHeight == INITIAL_ROW_HEIGHT && this.state.rowHeight != INITIAL_ROW_HEIGHT) {
            this.updateAllLayoutsView();
        }

        if (prevProps.readonly === false && this.props.readonly === true) {
            this.setState({
                cols: this.getCols(),
            })
            setTimeout(
                () => {
                    window.dispatchEvent(new Event('resize'));
                },
                1
            );
        }


    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateAllLayoutsView);
    }

    getCols = () => {
        let n_cols
        if (this.props.readonly) {
            n_cols = 0
            for (const element of this.props.dashboard.layout) {
                const temp_cols = element.x + element.w
                if (temp_cols > n_cols) {
                    n_cols = temp_cols
                }
            }
        } else {
            n_cols = COLS
        }
        return n_cols
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
            this.props.updateDashboard({
                ...this.props.dashboard,
                layout: layout,
            })
            this.updateAllLayoutsView();
        }
    };

    /**
     * Calls when resize is complete
     * @param e The update layouts (returns an array of all layouts in the GridLayoutView)
     * @param layout current updated layout
     */
    resizeStop = (e, layout) => {
        this.updateLayoutView(layout.i);
    };

    /**
     * Update {width,height} of layout item content
     * @param key
     */
    updateLayoutView = (key) => {
        const graphsSize = { ...this.state.graphsSize };
        graphsSize[key] = {
            width: this.ref[key].clientWidth,
            height: this.ref[key].clientHeight,
        };
        this.setState({ graphsSize: graphsSize });
    };

    /**
     * Update {width,height} of all blocks content on every block dimentions change
     */
    updateAllLayoutsView = () => {
        const graphsSize = { ...this.state.graphsSize };
        for (const layout of this.props.dashboard.layout) {
            const key = layout.i
            graphsSize[key] = {
                width: this.ref[key].clientWidth,
                height: this.ref[key].clientHeight,
            };
        }
        this.setState({ graphsSize });
    };

    onBlockClick = (e, id) => {
        e.preventDefault();
        if (id) {
            this.props.updateSelectedBlock(id);
        }
    };

    onWidthChange = (width, margin, cols, containerPadding) => {
        //  Update height to keep grid ratio to 16/9
        this.setState({ rowHeight: width / cols / GRID_RATIO });
    }

    render() {
        const { blocks, layout } = this.props.dashboard;
        return (
            <ResponsiveGridLayout
                className="dashboard-grid"
                id="ResponsiveGridLayout"
                layouts={{ lg: layout }}
                isDraggable={!this.props.readonly}
                isResizable={!this.props.readonly}
                breakpoints={{ lg: 1, md: 0, sm: 0, xs: 0, xxs: 0 }}
                cols={{ lg: this.state.cols, md: this.state.cols, sm: this.state.cols, xs: this.state.cols, xxs: this.state.cols }}
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
                                <Space style={{ position: "fixed", top: 1, right: 1, zIndex: 2 }}>
                                    <div className="block-edit">
                                        <Button size="small" icon={<EditTwoTone />}
                                            onClick={(e) => this.onBlockClick(e, layout.i)} />
                                    </div>
                                    <div className="block-grab">
                                        <Button size="small" icon={<DragOutlined />} />
                                    </div>
                                </Space>
                            )}
                            <BlockViewManager
                                timeseriesData={this.props.blockData(blocks[layout.i])}
                                currentBlock={blocks[layout.i]}
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
                                dashboard={this.props.dashboard}
                                optionsLabel={this.props.optionsLabel}
                                updateDashboard={this.props.updateDashboard}
                            />
                        </div>
                    </div>
                ))}
            </ResponsiveGridLayout>
        );
    }
}

export default DashboardConfigView;
