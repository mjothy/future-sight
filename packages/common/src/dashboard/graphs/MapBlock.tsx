import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import * as _ from 'lodash';
import { Button, Col, Row, Select, Tooltip } from 'antd';
import { Option } from 'antd/lib/mentions';
import bbox from "@turf/bbox"
import geoViewport from "@mapbox/geo-viewport";
import { FullscreenExitOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';

export default class MapBlock extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            geoJsonData: {},
            blockData: this.props.blockData(this.props.currentBlock),
            visualData: {
                model: null,
                scenario: null,
                variable: null,
            },
            center: { lon: -74, lat: 43 },
            zoom: 3,
        };
    }

    async componentDidMount(): Promise<void> {
        const geoJsonData = await this.props.dataManager.fetchRegionsGeojson({
            regions: this.props.data.regions,
        });
        const state: any = {
            geoJsonData: geoJsonData,
            blockData: this.props.blockData(this.props.currentBlock),
        };

        const obj = this.setMapProperities(geoJsonData);
        if (obj != null) {
            state.center = obj.center;
            state.zoom = obj.zoom;
        }
        this.setState({ ...state });
    }

    async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): Promise<void> {
        if (
            !_.isEqual(
                prevProps.currentBlock.config.metaData,
                this.props.currentBlock.config.metaData
            )
        ) {
            const geoJsonData = await this.props.dataManager.fetchRegionsGeojson({
                regions: this.props.data.regions,
            });
            this.setState({
                geoJsonData: geoJsonData,
                blockData: this.props.blockData(this.props.currentBlock),
            });
        }
    }

    // shouldComponentUpdate(
    //     nextProps: Readonly<any>,
    //     nextState: Readonly<any>,
    //     nextContext: any
    // ): boolean {
    //     if (
    //         !_.isEqual(nextState.geoJsonData, this.state.geoJsonData) ||
    //         !_.isEqual(nextProps.currentBlock.config, this.props.currentBlock.config)
    //     ) {
    //         return true;
    //     }

    //     if (
    //         this.props.width != nextProps.width ||
    //         this.props.height != nextProps.height
    //     ) {
    //         return true;
    //     }

    //     if (!_.isEqual(nextState.visualData, this.state.visualData)) {
    //         return true;
    //     }

    //     return false;
    // }

    onChange = (option, selectedData) => {
        const visualData = { ...this.state.visualData };
        visualData[option] = selectedData;
        this.setState({ visualData });
    };

    getMapData = (year = 2020) => {
        const locations: string[] = [];
        const z: number[] = [];
        let unit = '';
        const options = this.getOptionsSelected();
        let extractArg = [];


        if (options.length <= 0) {
            extractArg = this.state.blockData;
        } else {
            let possibleData = JSON.parse(JSON.stringify(this.state.blockData));
            options.forEach((key) => {
                extractArg = possibleData.filter(
                    (d) => d[key] == this.state.visualData[key]
                );
                possibleData = extractArg;
            });
        }

        extractArg.forEach((regionData: any) => {
            const value_2020 = regionData.data?.find(
                (dataPoint) => dataPoint.year == year
            );
            if (value_2020 != null) {
                z.push(Number(Number(value_2020.value)?.toFixed(2)));
                locations.push(regionData['region']);
            }
            if (regionData.unit != null) {
                unit = regionData.unit;
            }
        });

        // Prepare Data
        const data: any = [];
        data.push({
            type: 'choroplethmapbox',
            colorscale: "PuBu",
            locations,
            z,
            geojson: this.state.geoJsonData,
            showscale: true,
            colorbar: {
                title: {
                    text: 'value (' + unit + ')',
                    side: "right"
                }
            },
            hoverinfo: "location+z",
        });

        return data;
    };

    getOptionsSelected = () => {
        const options: string[] = [];
        Object.keys(this.state.visualData).forEach((key) => {
            if (this.state.visualData[key] != null) {
                options.push(key);
            }
        });
        return options;
    };

    zoomToFeatures = () => {
        const obj = this.setMapProperities(this.state.geoJsonData);
        if (obj != null) {
            this.setState({ center: obj.center, zoom: obj.zoom })
        }
    }

    setMapProperities = (geoJsonData) => {
        if (geoJsonData.features != undefined) {
            let center: any = { lon: -74, lat: 43 };
            let zoom = 3;
            const bbox1 = bbox(geoJsonData);
            const center_coor = {};
            const center_zoom = geoViewport.viewport(bbox1, [this.props.width, this.props.height]);
            center_coor["lon"] = center_zoom.center[0];
            center_coor["lat"] = center_zoom.center[1];
            center = center_coor;
            zoom = center_zoom.zoom;
            console.log("center: ", center);
            console.log("zoom: ", zoom);

            return { center, zoom: zoom - 1 }
        }

        return null;
    }

    zoomOut = () => {
        this.setState({ zoom: this.state.zoom - 1 });
    }

    zoomIn = () => {
        this.setState({ zoom: this.state.zoom + 1 });
    }

    render() {
        const meteData = this.props.currentBlock.config.metaData;
        // Prepare Layout
        const layout: any = {
            width: this.props.width,
            height: this.props.height,
            font: {
                size: 10,
            },
            // dragmode: 'zoom',
            mapbox: {
                style: 'carto-positron',
                center: this.state.center,
                zoom: this.state.zoom
            },
            margin: { r: 0, t: 0, b: 0, l: 0 },
            // margin: { r: 0, t: this.props.currentBlock.config.configStyle.title.isVisible ? 30 : 0, b: 0, l: 0 },
            // title: this.props.currentBlock.config.configStyle.title.isVisible ? this.props.currentBlock.config.configStyle.title.value : "Title"
        };

        // Prepare Config
        const config = {
            displayModeBar: false, // this is the line that hides the bar.
            editable: false,
        };
        return (
            <div style={{ height: '100%', width: '100%' }}>
                <div>
                    <Plot data={this.getMapData()} layout={layout} config={config}
                        onDoubleClick={this.zoomToFeatures}
                    />
                </div>
                <div
                    style={{ marginTop: -this.props.height + 'px', marginLeft: '5px' }}
                >
                    <Row
                        justify="start"
                    >
                        {meteData.models?.length > 1 && (
                            <Col span={4}
                            >
                                {' '}
                                <Select
                                    allowClear
                                    value={this.state.visualData['model']}
                                    className="width-90"
                                    dropdownMatchSelectWidth={false}
                                    size="small"
                                    placeholder="models"
                                    onChange={(selectedData) =>
                                        this.onChange('model', selectedData)
                                    }
                                >
                                    {meteData.models?.map((value: string) => (
                                        <Option key={value} value={value}>
                                            {value}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        )}

                        {meteData.scenarios?.length > 1 && (
                            <Col span={4}>
                                {' '}
                                <Select
                                    allowClear
                                    value={this.state.visualData['scenario']}
                                    className="width-90"
                                    dropdownMatchSelectWidth={false}
                                    size="small"
                                    placeholder="scenarios"
                                    onChange={(selectedData) =>
                                        this.onChange('scenario', selectedData)
                                    }
                                >
                                    {meteData.scenarios?.map((value: string) => (
                                        <Option key={value} value={value}>
                                            {value}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        )}

                        {meteData.variables?.length > 1 && (
                            <Col span={4}>
                                <Select
                                    allowClear
                                    value={this.state.visualData['variable']}
                                    className="width-90"
                                    dropdownMatchSelectWidth={false}
                                    size="small"
                                    placeholder="variables"
                                    onChange={(selectedData) =>
                                        this.onChange('variable', selectedData)
                                    }
                                >
                                    {meteData.variables?.map((value: string) => (
                                        <Option key={value} value={value}>
                                            {value}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        )}
                    </Row>
                </div>

                <div style={{ marginLeft: '5px' }}
                >
                    {/* <Row justify='center'>
                        <Col span={12}>
                            
                        </Col>

                    </Row> */}
                    <Tooltip placement="rightTop" title={"zoom in"}>
                        <Button className='mt-2' icon={<PlusOutlined />} size={"small"} onClick={this.zoomIn} /><br />
                    </Tooltip>
                    <Tooltip placement="rightTop" title={"zoom out"}>
                        <Button className='mt-2' icon={<MinusOutlined />} size={"small"} onClick={this.zoomOut} /> <br />
                    </Tooltip>
                    <Tooltip placement="rightTop" title={"zoom to features"}>
                        <Button className='mt-2' icon={<FullscreenExitOutlined />} size={"small"} onClick={this.zoomToFeatures} />
                    </Tooltip>
                </div>

            </div>
        );
    }
}
