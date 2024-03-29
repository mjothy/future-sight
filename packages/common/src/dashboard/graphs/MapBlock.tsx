import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import * as _ from 'lodash';
import { Button, Col, Row, Select, Tooltip } from 'antd';
import { Option } from 'antd/lib/mentions';
import bbox from "@turf/bbox"
import geoViewport from "@mapbox/geo-viewport";
import { FullscreenExitOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import withGetGeoJson from '../../services/withGetGeoJson';
import PlotlyUtils from './PlotlyUtils';

interface MapProperties {
    center: { lon: number, lat: number };
    zoom: number
}

class MapBlock extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            geoJsonData: {},
            visibleRegions: [],
            visibleData: [],
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
            sliderActive: 0
        };
    }

    async componentDidMount(): Promise<void> {
        const geoJsonData = await this.props.getGeoJson({
            regions: this.props.currentBlock.config.metaData.regions,
        });
        const visibleGeoJson = this.getVisibleGeojson(geoJsonData);
        const visibleRegions = this.getVisibleRegions(visibleGeoJson);
        const visibleData = this.getVisibleData(visibleRegions);
        const obj: MapProperties = this.getMapProperities(visibleGeoJson);
        this.setState({
            geoJsonData: visibleGeoJson,
            visibleRegions,
            visibleData,
            zoom: obj.zoom,
            center: obj.center,

        })
    }

    async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): Promise<void> {
        if (!_.isEqual(prevProps.currentBlock.config.metaData, this.props.currentBlock.config.metaData)
            || !_.isEqual(prevProps.data, this.props.data)) {
            const geoJsonData = await this.props.getGeoJson({
                regions: this.props.currentBlock.config.metaData.regions,
            });
            const visibleGeoJson = this.getVisibleGeojson(geoJsonData);
            const visibleRegions = this.getVisibleRegions(visibleGeoJson);
            const visibleData = this.getVisibleData(visibleRegions);
            this.setState({
                geoJsonData: visibleGeoJson,
                visibleRegions,
                visibleData,
                visualData: {
                    model: null,
                    scenario: null,
                    variable: null,
                },
            })
        }

        if (this.state.geoJsonData != prevState.geoJsonData) {
            const obj: MapProperties = this.getMapProperities(this.state.geoJsonData);
            this.setState({
                zoom: obj.zoom,
                center: obj.center,
            })
        }
    }

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

        const sliderSteps: any[] = []
        const uniq_x = this.getOrderedUniqueX()

        for (const year of uniq_x) {
            // Frame
            const frame: any = {
                data: this.getMapData(year),
                name: year,
            }
            frames.push(frame)
            // Slider step
            const sliderStep = {
                label: year,
                method: 'animate',
                args: [[year], {
                    mode: 'immediate',
                    frame: { redraw: true, duration: 0 },
                    transition: { duration: 0 }
                }]
            }
            sliderSteps.push(sliderStep)
        }

        const sliderConfig = {
            active: this.state.sliderActive,
            pad: { t: 3, b: 8, r: 5, l: 5 },
            currentvalue: {
                visible: false
            },
            steps: sliderSteps,
            len: this.props.width,
            lenmode: "pixels"
        }

        let data: any = [{
            type: 'choroplethmapbox',
            colorscale: "PuBu",
            geojson: {},
        }];

        if (frames.length > this.state.sliderActive) {
            data = frames[this.state.sliderActive].data;
        }

        return [frames, data, sliderConfig]
    }

    getMapLayout = () => {
        const zoom_diff = this.state.zoom > 1 ? 1.15 : 0;
        const layout: any = {
            width: this.props.width,
            height: this.props.height,
            font: {
                size: 10,
            },
            mapbox: {
                style: 'carto-positron',
                center: this.state.center,
                zoom: this.state.zoom - zoom_diff
            },
            transition: { duration: 1000 },
            // margin: { r: 0, t: 0, b: 0, l: 0 },
            margin: { r: 0, t: this.props.currentBlock.config.configStyle.title.isVisible ? 30 : 0, b: 0, l: 0 },
            title: this.props.currentBlock.config.configStyle.title.isVisible ? this.props.currentBlock.config.configStyle.title.value : "Title"
        };
        return layout;
    }

    /**
     * Get the map data
     * @param year the selected year in slidebar
     * @returns data
     */
    getMapData = (year = 2020) => {
        const extractData = this.getFirstData();
        const data: any = [];
        let obj: any = {
            type: 'choroplethmapbox'
        }
        if (extractData.length > 0) {
            const { locations, z } = this.getMapConfig(extractData, year);
            const configStyle = this.props.currentBlock.config.configStyle;

            // Prepare Data
            const plotlyColorscale = configStyle.colorscale.map((x, i) => { return [i / (configStyle.colorscale.length - 1), x] });
            obj = {
                ...obj,
                type: 'choroplethmapbox',
                colorscale: plotlyColorscale,
                locations,
                z,
                geojson: this.state.geoJsonData,
                showscale: configStyle.colorbar.isShow && this.state.visibleRegions.length > 0,
                reversescale: configStyle.colorbar.reverse,
                colorbar: {
                    title: {
                        text: this.getColorbarTitle(configStyle.colorbar.title, extractData[0].variable, extractData[0].unit),
                        side: "right"
                    },
                    len: 0.95,
                    thickness: 10,
                    // xanchor: "right", x: 1,
                    // lenmode: "pixels",
                    // len: this.props.height - 80
                },
                marker: {
                    colorscale: plotlyColorscale
                },
                hovertext: "model: " + extractData[0].model + "<br>" + "scenario: " + extractData[0].scenario,
                hoverinfo: "location+z+text",
            };
        }
        data.push(obj);
        return data;
    };

    /**
     * Get map locations and z (colorbar data)
     * @param data Visible data layer
     * @param year Selected year in slider
     * @returns
     */
    getMapConfig = (data, year) => {
        const locations: string[] = [];
        const z: number[] = [];

        data.forEach((regionData: any) => {
            const value_year = regionData.data?.find(
                (dataPoint) => dataPoint.year == year
            );
            if (value_year != null) {
                z.push(Number(Number(value_year.value)?.toFixed(2)));
                locations.push(regionData['region']);
            }
        });

        return { locations, z }
    }

    getColorbarTitle = (config, variable, unit) => {
        let text = '';
        if (config.variable && config.unit) {
            text = variable + '<br>' + unit;
        } else {
            if (config.variable) {
                text = text + variable;
            } else if (config.unit) {
                text = text + unit
            }
        }

        text = PlotlyUtils.getLabel(text, this.props.height, "cbtitle") as string;
        return text;
    }

    /**
     * When different layers of data is possible to be presented in the map,
     * return only the first {model, scenario, variable} for different regions
     * @returns extractData(data to visualized) and unit
     */
    getFirstData = () => {
        const options = this.getOptionsSelected();
        let mapDataTimeseries = JSON.parse(JSON.stringify(this.state.visibleData));

        if (options.length > 0) {
            options.forEach((key) => {
                mapDataTimeseries = mapDataTimeseries.filter(
                    (d) => d[key] == this.state.visualData[key]
                );
            });
        }

        const extractData: any = [];

        if (mapDataTimeseries.length > 0) {
            const firstElement = mapDataTimeseries[0]; // first raw of one region
            extractData.push(firstElement);
            // Get other raws whith same {model, scenario, variable} but different region
            this.state.visibleRegions.forEach(region => {
                if (region != firstElement["region"].toLowerCase()) {
                    const data_element = mapDataTimeseries.find(raw => raw["region"].toLowerCase() == region && raw["model"] == firstElement["model"] && raw["scenario"] == firstElement["scenario"] && raw["variable"] == firstElement["variable"]);
                    if (data_element) {
                        extractData.push(data_element);
                    }
                }
            });
        }
        return extractData;
    }

    /**
     * Get options of selected data in inputs in the map
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
     * Get geoJson of regions where data exist (to update the zoom and center properely after)
     * @returns geoJson of regions where data exist
     */
    getVisibleGeojson = (geoJsonData) => {
        let mapDataTimeseries = JSON.parse(JSON.stringify(this.props.timeseriesData));
        mapDataTimeseries = mapDataTimeseries.filter(element => element.data != null)
        const regions_mapData = mapDataTimeseries.map(raw => raw['region'].toLowerCase());
        let featuresVisibleRegions = [];
        featuresVisibleRegions = geoJsonData.features?.filter(feature => regions_mapData.includes(feature.properties["ADMIN"].toLowerCase()))
        const visibleGeoJson = {
            type: "FeatureCollection",
            features: featuresVisibleRegions
        };

        return visibleGeoJson;
    }

    getVisibleRegions = (visibleGeoJson) => {
        return visibleGeoJson != null ? visibleGeoJson.features.map((feature: any) => feature?.id.toLowerCase()) : [];
    }

    getVisibleData = (visibleRegions) => {
        let mapDataTimeseries = JSON.parse(JSON.stringify(this.props.timeseriesData));
        mapDataTimeseries = mapDataTimeseries.filter(element => element.data != null && visibleRegions.includes(element['region'].toLowerCase()));
        return mapDataTimeseries;
    }

    /**
     * Zoom on represented regions
     */
    zoomToFeatures = () => {
        const obj: MapProperties = this.getMapProperities(this.state.geoJsonData);
        if (obj != null) {
            this.setState({ center: obj.center, zoom: obj.zoom })
        }
    }

    /**
     * Set map center and zoom level based on geoJson
     * @param geoJsonData
     * @returns {zoom, center}
     */
    getMapProperities = (geoJsonData) => {
        const center: { lon: number, lat: number } = { lon: 0.17, lat: 43.05 };
        let zoom = 3;
        if (geoJsonData?.features != undefined) {

            const bbox1 = bbox(geoJsonData);
            const center_zoom = geoViewport.viewport(bbox1, [this.props.width, this.props.height - 10]);
            center["lon"] = center_zoom.center[0];
            center["lat"] = center_zoom.center[1];
            zoom = center_zoom.zoom;
        }
        return { center, zoom }
    }

    zoomOut = () => {
        this.setState({ zoom: this.state.zoom - 0.15 });
    }

    zoomIn = () => {
        this.setState({ zoom: this.state.zoom + 0.15 });
    }

    onChange = (option, selectedData) => {
        const visualData = { ...this.state.visualData };
        visualData[option] = selectedData;
        this.setState({ visualData });
    };

    onSliderChange = (e) => {
        const active = e.slider.active;
        if (typeof active === 'number' && !isNaN(active)) {
            this.setState({ sliderActive: e.slider.active })
        }
    }

    onRelayout = (e) => {
        if (e.mapbox != null) {
            const center = e.mapbox.center;
            const zoom = e.mapbox.zoom;
            this.setState({ center, zoom })
        }
    }

    render() {
        const meteData = this.props.currentBlock.config.metaData;
        let height = this.props.height;
        if (this.props.currentBlock.config.configStyle.title.isVisible) {
            height = height - 30;
        }

        const layout: any = this.getMapLayout();
        const [frames, data, sliderConfig] = this.getSliderConfigs()
        // Prepare Config
        const config = {
            displayModeBar: false, // this is the line that hides the bar.
            editable: false,
        };

        // SLIDER
        layout["sliders"] = [sliderConfig]

        return (
            <div>

                <div style={{ height: this.props.height, width: this.props.width }}>
                    <div>
                        <Plot data={data} layout={layout} config={config}
                            onDoubleClick={this.zoomToFeatures}
                            frames={frames}
                            onSliderChange={this.onSliderChange}
                            onRelayout={this.onRelayout}
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

export default withGetGeoJson(MapBlock)
