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
            visualData: {
                model: null,
                scenario: null,
                variable: null,
            },
            center: { lon: 0.17, lat: 43.05 },
            zoom: 3,
            data: [{
                type: 'choroplethmapbox',
                colorscale: "PuBu",
                geojson: {}
            }],
            frames: [],
            sliderConfig: [],
        };
    }

    async componentDidMount(): Promise<void> {
        const geoJsonData = await this.props.fetchRegionsGeojson({
            regions: this.props.currentBlock.config.metaData.regions,
        });
        // const [frames, sliderConfig] = this.getSliderConfigs()
        // let data = this.state.data;
        // if ((frames as any).lenght > 0) {
        //     data = frames[0].data
        // }
        // // const { data, visibleGeoJson } = this.getMapData(geoJsonData, 2020);

        // const state: any = {
        //     geoJsonData,
        //     frames,
        //     sliderConfig,
        //     data: data,
        //     // visibleGeoJson
        // };
        // const obj = this.setMapProperities(geoJsonData);
        // if (obj != null) {
        //     state.center = obj.center;
        //     state.zoom = obj.zoom;
        // }
        // this.setState({ ...state });
        this.setState({ geoJsonData })
    }

    // async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): Promise<void> {
    //     if (!_.isEqual(prevProps.currentBlock.config.metaData, this.props.currentBlock.config.metaData)
    //         || !_.isEqual(prevState.visualData, this.state.visualData)
    //         || this.props.timeseriesData?.length != prevProps.timeseriesData?.length) {
    //         const geoJsonData = await this.props.fetchRegionsGeojson({
    //             regions: this.props.currentBlock.config.metaData.regions,
    //         });
    //         const [frames, sliderConfig] = this.getSliderConfigs()
    //         const data: any = [];
    //         Object.values(frames)?.map(raw => {
    //             data.push(...raw.data)
    //         })
    //         // const { data, visibleGeoJson } = this.getMapData(geoJsonData, 2020);
    //         this.setState({
    //             geoJsonData,
    //             frames,
    //             sliderConfig,
    //             // data: data,
    //             data: frames[this.state.sliderConfig.active].data,
    //             // visibleGeoJson
    //         });
    //     }

    // }

    // Add slider START
    // TODO https://plotly.com/javascript/sliders/
    // https://plotly.com/javascript/gapminder-example/

    getOrderedUniqueX = () => {
        const concat_x: any[] = []
        for (const dataElement of this.props.data) {
            concat_x.push(...dataElement.x)
        }
        return [...new Set(concat_x)].sort((a, b) => a - b)
    }

    filterDataByX = (dataElement, x) => {
        const idx = (dataElement.x.filter((element) => Number(element) <= x)).length
        return dataElement.y.slice(0, idx)
    }

    getSliderConfigs = () => {
        const frames: any[] = []
        const data: any[] = []

        const sliderSteps: any[] = []
        const uniq_x = this.getOrderedUniqueX()

        for (const year of uniq_x) {
            // Frame
            const frame: any = {
                data: this.getData(this.state.geoJsonData, year),
                name: year,
            }
            frames.push(frame)
            data.push(frame.data)
            console.log("frames x: ", frames);
            // Slider step
            const sliderStep = {
                label: year,
                method: 'animate',
                args: [[year], {
                    mode: 'immediate',
                    frame: { redraw: false, duration: 0 },
                    transition: { duration: 0 }
                }]
            }
            sliderSteps.push(sliderStep)
        }

        const defaultYearIndex = 2020;
        const sliderConfig = {
            active: 0,
            pad: { t: 5, b: 5 },
            x: 0.05,
            len: 0.95,
            currentvalue: {
                xanchor: 'right',
                prefix: 'year: ',
                font: {
                    color: '#888',
                    size: 20
                }
            },
            // By default, animate commands are bound to the most recently animated frame:
            steps: sliderSteps
        }

        if (frames.length < 0) {
            data.push({
                type: 'choroplethmapbox',
                colorscale: "PuBu",
                geojson: {}
            })
        }
        return [frames, data, sliderConfig]
    }
    // Add slider FIN

    onChange = (option, selectedData) => {
        const visualData = { ...this.state.visualData };
        visualData[option] = selectedData;
        this.setState({ visualData });
    };

    /**
     * Get the map data
     * @param year the selected year in slidebar
     * @returns data
     */
    getMapData = (geoJsonData, year = 2020) => {
        const locations: string[] = [];
        const z: number[] = [];
        const options = this.getOptionsSelected();
        let mapDataTimeseries = JSON.parse(JSON.stringify(this.props.timeseriesData));

        if (options.length > 0) {
            options.forEach((key) => {
                mapDataTimeseries = mapDataTimeseries.filter(
                    (d) => d[key] == this.state.visualData[key]
                );
            });
        }
        console.log("debug mapDataTimeseries: ", mapDataTimeseries);
        const { extractData, unit } = this.getFirstData(mapDataTimeseries);

        console.log("debug extractArg: ", extractData);
        extractData.forEach((regionData: any) => {
            const value_2020 = regionData.data?.find(
                (dataPoint) => dataPoint.year == year
            );
            if (value_2020 != null) {
                z.push(Number(Number(value_2020.value)?.toFixed(2)));
                locations.push(regionData['region']);
            }
        });

        // Prepare Data
        const visibleGeoJson = this.getGeoJsonOfVisibleRegions(geoJsonData, extractData);
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
                },
                len: 0.95,
                thickness: 10,
                // xanchor: "right", x: 1,
                // lenmode: "pixels",
                // len: this.props.height - 80
            },
            hoverinfo: "location+z",
        });
        return { data, visibleGeoJson };
    };

    getData = (geoJsonData, year = 2020) => {
        const locations: string[] = [];
        const z: number[] = [];
        const options = this.getOptionsSelected();
        let mapDataTimeseries = JSON.parse(JSON.stringify(this.props.timeseriesData));

        if (options.length > 0) {
            options.forEach((key) => {
                mapDataTimeseries = mapDataTimeseries.filter(
                    (d) => d[key] == this.state.visualData[key]
                );
            });
        }
        console.log("debug mapDataTimeseries: ", mapDataTimeseries);
        const { extractData, unit } = this.getFirstData(mapDataTimeseries);

        console.log("debug extractArg: ", extractData);
        extractData.forEach((regionData: any) => {
            const value_2020 = regionData.data?.find(
                (dataPoint) => dataPoint.year == year
            );
            if (value_2020 != null) {
                z.push(Number(Number(value_2020.value)?.toFixed(2)));
                locations.push(regionData['region']);
            }
        });

        // Prepare Data
        const visibleGeoJson = this.getGeoJsonOfVisibleRegions(geoJsonData, extractData);
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
                },
                len: 0.95,
                thickness: 10,
                // xanchor: "right", x: 1,
                // lenmode: "pixels",
                // len: this.props.height - 80
            },
            hoverinfo: "location+z",
        });
        return data;
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

    /**
     * When possible data possible to be presented in the map, return only the first raws with different region
     * and same {model, scenario, variable}
     * @param mapDataTimeseries data when timederies != null
     * @returns extractData(data to visualized) and unit
     */
    getFirstData = (mapDataTimeseries) => {
        const extractData: any = [];
        let unit = null;
        if (mapDataTimeseries.length > 0) {
            const firstElement = mapDataTimeseries[0]; // first raw of one region
            extractData.push(firstElement);
            unit = firstElement.unit;
            // get other raws whith same data but region different
            mapDataTimeseries.forEach(raw => {
                if (raw["region"] != firstElement["region"] && raw["model"] == firstElement["model"] && raw["scenario"] == firstElement["scenario"] && raw["variable"] == firstElement["variable"]) {
                    extractData.push(raw);
                }
            })
        }
        return { extractData, unit }
    }

    /**
     * get geoJson of regions where data exist (to update the zoom and center properely after)
     * @param geoJsonData geojson of all selected regions in block
     * @param extractedData data that is represented in the map (one data with timeseries for each region)
     * @returns geoJson of regions where data exist
     */
    getGeoJsonOfVisibleRegions = (geoJsonData, extractedData) => {
        const visibleRegions = extractedData.map(raw => { if (raw.data != null) return raw["region"].toLowerCase() })
        let featuresVisibleRegions = [];
        if (geoJsonData != null) {
            featuresVisibleRegions = geoJsonData.features?.filter(feature => visibleRegions.includes(feature.properties["ADMIN"].toLowerCase()))
        }
        const visibleGeoJson = {
            type: "FeatureCollection",
            features: featuresVisibleRegions
        };

        return visibleGeoJson;
    }

    /**
     * Zoom on represented regions
     */
    zoomToFeatures = () => {
        const obj = this.setMapProperities(this.state.visibleGeoJson);
        if (obj != null) {
            this.setState({ center: obj.center, zoom: obj.zoom })
        }
    }

    /**
     * Set map center and zoom level based on geoJson
     * @param geoJsonData
     * @returns {zoom, center}
     */
    setMapProperities = (geoJsonData) => {
        let center: any = { lon: 0.17, lat: 43.05 };
        let zoom = 3;
        if (geoJsonData?.features != undefined) {

            const bbox1 = bbox(geoJsonData);
            const center_coor = {};
            const center_zoom = geoViewport.viewport(bbox1, [this.props.width, this.props.height]);
            center_coor["lon"] = center_zoom.center[0];
            center_coor["lat"] = center_zoom.center[1];
            center = center_coor;
            zoom = center_zoom.zoom;
        }
        return { center, zoom: zoom - 1 }
    }

    zoomOut = () => {
        this.setState({ zoom: this.state.zoom - 1 });
    }

    zoomIn = () => {
        this.setState({ zoom: this.state.zoom + 1 });
    }

    getMapDataTimeSeries = () => {
        const options = this.getOptionsSelected();
        let mapDataTimeseries = JSON.parse(JSON.stringify(this.props.timeseriesData));

        if (options.length > 0) {
            options.forEach((key) => {
                mapDataTimeseries = mapDataTimeseries.filter(
                    (d) => d[key] == this.state.visualData[key]
                );
            });
        }

        return mapDataTimeseries;
    }
    getVisibleGeoJson = (geoJsonData) => {
        const mapDataTimeseries = this.getMapDataTimeSeries();
        const { extractData, unit } = this.getFirstData(mapDataTimeseries);
        // Prepare Data
        const visibleGeoJson = this.getGeoJsonOfVisibleRegions(geoJsonData, extractData);
        return visibleGeoJson;
    }

    getLayout = () => {
        const visibleGeoJson = this.getVisibleGeoJson(this.state.geoJsonData);
        const obj: any = this.setMapProperities(visibleGeoJson);
        const layout: any = {
            width: this.props.width,
            height: this.props.height,
            font: {
                size: 10,
            },
            mapbox: {
                style: 'carto-positron',
                center: obj.center,
                zoom: obj.zoom
            },
            // margin: { r: 0, t: 0, b: 0, l: 0 },
            margin: { r: 0, t: this.props.currentBlock.config.configStyle.title.isVisible ? 30 : 0, b: 0, l: 0 },
            title: this.props.currentBlock.config.configStyle.title.isVisible ? this.props.currentBlock.config.configStyle.title.value : "Title"
        };
        return layout;
    }

    render() {
        const meteData = this.props.currentBlock.config.metaData;
        let height = this.props.height;
        if (this.props.currentBlock.config.configStyle.title.isVisible) {
            height = height - 30;
        }

        const layout: any = this.getLayout();
        const [frames, data, sliderConfig] = this.getSliderConfigs()
        // Prepare Config
        //TODO add hide/show colorbar to config
        const config = {
            displayModeBar: false, // this is the line that hides the bar.
            editable: false,
        };

        // SLIDER
        console.log("config: ", sliderConfig);
        layout["sliders"] = [sliderConfig]

        console.log("debug frames: ", frames);
        console.log("debug layout: ", layout);

        return (
            <div>

                <div style={{ height: this.props.height, width: this.props.width }}>
                    <div>
                        <Plot data={data} layout={layout} config={config}
                            onDoubleClick={this.zoomToFeatures}
                            frames={frames}
                        />
                    </div>
                    <div style={{ marginTop: -(height) + 'px', marginLeft: '5px' }}>
                        <Row justify="start" >
                            {meteData.models?.length > 1 && (
                                <Col span={4}
                                >
                                    <Tooltip placement="top" title={"Model"}>
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
                                    <Tooltip placement="top" title={"Scenario"}>
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
                                    </Tooltip>
                                </Col>
                            )}

                            {meteData.variables?.length > 1 && (
                                <Col span={4}>
                                    <Tooltip placement="top" title={"Variable"}>
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
                                    </Tooltip>
                                </Col>
                            )}
                        </Row>
                    </div>

                    <div style={{ marginLeft: '5px' }}>
                        <Tooltip placement="right" title={"zoom in"}>
                            <Button className='mt-2' icon={<PlusOutlined />} size={"small"} onClick={this.zoomIn} /><br />
                        </Tooltip>
                        <Tooltip placement="right" title={"zoom out"}>
                            <Button className='mt-2' icon={<MinusOutlined />} size={"small"} onClick={this.zoomOut} /> <br />
                        </Tooltip>
                        <Tooltip placement="right" title={"zoom to features"}>
                            <Button className='mt-2' icon={<FullscreenExitOutlined />} size={"small"} onClick={this.zoomToFeatures} />
                        </Tooltip>
                    </div>

                </div>
            </div>
        );
    }
}
