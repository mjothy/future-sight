import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import * as _ from "lodash";


// interface Layer {
//     source;
//     type
// }
export default class MapBlock extends Component<any, any> {
    constructor(props) {
        super(props)
        this.state = {
            geoJsonData: {}
        }
    }

    async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): Promise<void> {
        const geoJsonData = await this.props.dataManager.fetchRegionsGeojson({ regions: this.props.data.regions });
        console.log("geoJsonData: ", geoJsonData)
        console.log("regions: ", this.props.data.regions)
        this.setState({ geoJsonData: geoJsonData })
    }

    // shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean {
    //     if (_.isEqual(nextState.geoJsonData, this.state.geoJsonData)) {
    //         return false;
    //     }
    //     return true;
    // }

    render() {
        const locations: string[] = []
        const z: number[] = [];
        // exemple 2020
        const blockData = this.props.blockData(this.props.currentBlock);
        console.log("blockData: ", blockData);
        let unit = '';

        blockData.forEach(regionData => {
            const value_2020 = regionData.data?.filter(dataPoint => dataPoint.year == 2020);
            if (value_2020 != null) {
                z.push(value_2020[0].value);
                locations.push(regionData['region']);
            }
            if (regionData.unit != null) {
                unit = regionData.unit;
            }
        });

        const data: any = []

        let layout: any = {
            width: this.props.width,
            height: this.props.height,
            font: {
                size: 10,
            },
            dragmode: "zoom",
            mapbox: {
                style: "carto-positron",
                // center: { lat: 38, lon: -90 },
                // zoom: 3,
                fitbounds: "locations"
            },
            margin: { r: 0, t: 30, b: 20, l: 0 },
        };
        if (this.props.currentBlock.config.configStyle.title.isVisible) {
            layout = {
                ...layout,
                title: this.props.currentBlock.config.configStyle.title.value,
            };
        }

        data.push({
            type: "choroplethmapbox",
            // locationmode: 'country names',
            // colorscale: [[0, 'rgb(255,255,255)'], [1, 'rgb(0,0,255)']],
            colorscale: "PuBu",
            locations,
            z,
            geojson: this.state.geoJsonData,
            showscale: true,
            colorbar: {
                title: "value (" + unit + ")"
            }
        })

        console.log("data: ", data);
        return (
            <Plot
                data={data}
                layout={layout}
            />
        )
    }
}