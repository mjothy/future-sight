import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import * as _ from 'lodash';
import { Col, Row, Select } from 'antd';
import { Option } from 'antd/lib/mentions';

// interface Layer {
//     source;
//     type
// }
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
        };
    }

    async componentDidMount(): Promise<void> {
        const geoJsonData = await this.props.dataManager.fetchRegionsGeojson({
            regions: this.props.data.regions,
        });
        this.setState({
            geoJsonData: geoJsonData,
            blockData: this.props.blockData(this.props.currentBlock),
        });
    }

    async componentDidUpdate(
        prevProps: Readonly<any>,
        prevState: Readonly<any>,
        snapshot?: any
    ): Promise<void> {
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

    shouldComponentUpdate(
        nextProps: Readonly<any>,
        nextState: Readonly<any>,
        nextContext: any
    ): boolean {
        if (
            !_.isEqual(nextState.geoJsonData, this.state.geoJsonData) ||
            !_.isEqual(nextProps.currentBlock.config, this.props.currentBlock.config)
        ) {
            return true;
        }

        if (
            this.props.width != nextProps.width ||
            this.props.height != nextProps.height
        ) {
            return true;
        }

        if (!_.isEqual(nextState.visualData, this.state.visualData)) {
            return true;
        }

        return false;
    }

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
            // colorscale: [
            //     [0, 'rgba(255,255,255,0.7)'],
            //     [1, 'rgba(0,0,255,0.7)'],
            // ],
            colorscale: "PuBu",
            // colorscale: [
            //     [0, "rgba(255, 0, 0, 0.5)"],
            //     [0.5, "rgba(255, 255, 0, 0.5)"],
            //     [1, "rgba(0, 255, 0, 0.5)"]
            // ],
            locations,
            z,
            geojson: this.state.geoJsonData,
            showscale: true,
            colorbar: {
                title: 'value (' + unit + ')',
            },
            // fitbounds: "geojson"
            hoverinfo: "location+z",
        });
        console.log('data: ', data);

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

    render() {
        const meteData = this.props.currentBlock.config.metaData;
        // Prepare Layout
        let layout: any = {
            width: this.props.width,
            height: this.props.height - 50,
            font: {
                size: 10,
            },
            dragmode: 'zoom',
            mapbox: {
                style: 'carto-positron',
                // center: { lat: 52, lon: 10 },
                // zoom: 3,
                fitbounds: "geojson"
            },
            margin: { r: 0, t: 30, b: 20, l: 0 },
        };
        if (this.props.currentBlock.config.configStyle.title.isVisible) {
            layout = {
                ...layout,
                title: this.props.currentBlock.config.configStyle.title.value,
            };
        }
        // Prepare Config
        const config = {
            displayModeBar: false, // this is the line that hides the bar.
            editable: false,
            showTitle: false,
        };
        return (
            <div style={{ height: this.props.height, width: this.props.width }}>
                <Plot data={this.getMapData()} layout={layout} config={config} />
                <Row
                    justify="start"
                    className={'ml-20'}
                    style={{ height: '30px', fontSize: '7px' }}
                >
                    {meteData.models?.length > 1 && (
                        <Col span={7}>
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
                        <Col span={7}>
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
                        <Col span={7}>
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
        );
    }
}
