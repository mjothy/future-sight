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
            visibleGeoJson: {
                geoJsonOfVisibleData: {
                    type: "FeatureCollection",
                    features: []
                }
            },
            geoJsonData: {},
            /**
             * data with timeseries on current block
             */
            blockData: this.props.blockData(this.props.currentBlock),
            visualData: {
                model: null,
                scenario: null,
                variable: null,
            },
            center: { lon: -74, lat: 43 },
            zoom: 3,
            data: [{
                type: 'choroplethmapbox',
                colorscale: "PuBu",
                geojson: {}
            }]
        };
    }

    async componentDidMount(): Promise<void> {
        const geoJsonData = await this.props.dataManager.fetchRegionsGeojson({
            regions: this.props.data.regions,
        });
        const blockData = this.props.blockData(this.props.currentBlock);
        const { data, visibleGeoJson } = this.getMapData(geoJsonData, blockData, 2020);
        const state: any = {
            geoJsonData,
            blockData,
            data,
            visibleGeoJson
        };
        const obj = this.setMapProperities(geoJsonData);
        if (obj != null) {
            state.center = obj.center;
            state.zoom = obj.zoom;
        }
        this.setState({ ...state });
    }

    async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): Promise<void> {
        if (!_.isEqual(prevProps.currentBlock.config.metaData, this.props.currentBlock.config.metaData)
            || !_.isEqual(prevState.visualData, this.state.visualData)) {
            const geoJsonData = await this.props.dataManager.fetchRegionsGeojson({
                regions: this.props.data.regions,
            });
            const blockData = this.props.blockData(this.props.currentBlock);
            const { data, visibleGeoJson } = this.getMapData(geoJsonData, blockData, 2020);
            this.setState({
                geoJsonData,
                blockData,
                data,
                visibleGeoJson
            });
        }
    }

    onChange = (option, selectedData) => {
        const visualData = { ...this.state.visualData };
        visualData[option] = selectedData;
        this.setState({ visualData });
    };

    /**
     * 
     * @param year the selected year in slidebar
     * @returns data
     */
    getMapData = (geoJsonData, blockData, year = 2020) => {
        const locations: string[] = [];
        const z: number[] = [];
        let unit = '';
        const options = this.getOptionsSelected();
        let extractArg: any = [];

        if (options.length <= 0) {
            // Select the first data
            if (blockData.length > 0) {
                const firstElement = blockData[0];
                extractArg.push(firstElement);
                unit = firstElement.unit;
                blockData.forEach(raw => {
                    if (raw["region"] != firstElement["region"] && raw["model"] == firstElement["model"] && raw["scenario"] == firstElement["scenario"] && raw["variable"] == firstElement["variable"]) {
                        extractArg.push(raw);
                    }
                })
            }
        } else {
            let possibleData = JSON.parse(JSON.stringify(blockData));
            options.forEach((key) => {
                extractArg = possibleData.filter(
                    (d) => d[key] == this.state.visualData[key]
                );
                possibleData = extractArg;
            });
        }
        console.log("extractArg: ", extractArg);
        extractArg.forEach((regionData: any) => {
            console.log("regionData: ", regionData);
            const value_2020 = regionData.data?.find(
                (dataPoint) => dataPoint.year == year
            );
            if (value_2020 != null) {
                z.push(Number(Number(value_2020.value)?.toFixed(2)));
                locations.push(regionData['region']);
            }
            if (unit != null && regionData.unit != null) {
                unit = regionData.unit;
            }
        });

        // Prepare Data
        const visibleGeoJson = this.getGeoJsonOfVisibleRegions(geoJsonData, extractArg);
        const data: any = [];
        data.push({
            type: 'choroplethmapbox',
            colorscale: "PuBu",
            locations,
            z,
            geojson: { ...visibleGeoJson },
            showscale: true,
            colorbar: {
                title: {
                    text: 'value (' + unit + ')',
                    side: "right"
                }
            },
            hoverinfo: "location+z",
        });
        return { data, visibleGeoJson };
    };

    /**
     * get options of selected data in inputs in the map
     * Exemple: if user selecte 2 models [model1, model2], select box will be shown in the map to select only one value
     * @returns 
     */
    getOptionsSelected = () => {
        const options: string[] = [];
        Object.keys(this.state.visualData).forEach((key) => {
            if (this.state.visualData[key] != null) {
                options.push(key);
            }
        });
        return options;
    };

    getGeoJsonOfVisibleRegions = (geoJsonData, visibleData) => {
        // update geoJson
        const visibleRegions = visibleData.map(raw => { if (raw.data != null) return raw["region"].toLowerCase() })
        console.log("visibleRegions: ", visibleRegions);
        const featuresVisibleRegions = geoJsonData.features?.filter(feature => visibleRegions.includes(feature.properties["ADMIN"].toLowerCase()))
        const visibleGeoJson = {
            type: "FeatureCollection",
            features: featuresVisibleRegions
        };

        return visibleGeoJson;
    }

    zoomToFeatures = () => {
        const obj = this.setMapProperities(this.state.visibleGeoJson);
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
            const center_zoom = geoViewport.viewport(bbox1, [this.props.width, this.props.height - 50]);
            center_coor["lon"] = center_zoom.center[0];
            center_coor["lat"] = center_zoom.center[1];
            center = center_coor;
            zoom = center_zoom.zoom;
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

        const layout: any = {
            width: this.props.width,
            height: this.props.height - 50,
            font: {
                size: 10,
            },
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
        //TODO add hide/show colorbar to config
        const config = {
            displayModeBar: false, // this is the line that hides the bar.
            editable: false,
        };
        return (
            <div>

                <div style={{ height: this.props.height - 50, width: this.props.width }}>
                    <div>
                        <Plot data={this.state.data} layout={layout} config={config}
                            onDoubleClick={this.zoomToFeatures}
                        />
                    </div>
                    <div style={{ marginTop: -(this.props.height - 50) + 'px', marginLeft: '5px' }}>
                        <Row justify="start" >
                            {meteData.models?.length > 1 && (
                                <Col span={4}
                                >
                                    <Tooltip placement="rightTop" title={"Model"}>
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
                                    </Tooltip>
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

                    <div style={{ marginLeft: '5px' }}>
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

                <div style={{ height: 50, width: this.props.width }}>
                    Slider
                </div>
            </div>
        );
    }
}
