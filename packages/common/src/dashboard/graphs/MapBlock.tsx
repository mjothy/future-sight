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

    async componentDidMount(): Promise<void> {
        const geoJsonData = await this.props.dataManager.fetchRegionsGeojson({ regions: this.props.data.regions });
        console.log("geoJsonData: ", geoJsonData)
        console.log("regions: ", this.props.data.regions)
        this.setState({ geoJsonData: geoJsonData })
    }

    render() {
        const geojson: any = { type: "FeatureCollection", features: [] }
        const dataGeo = JSON.parse(JSON.stringify(this.state.geoJsonData));
        const data: any = []

        const z: number[] = [];
        const n = 3;
        const ids = new Set();
        // Object.keys(dataGeo).forEach((regionKey: any) => {
        //     if (dataGeo[regionKey].features.length > 0) {
        //         dataGeo[regionKey].features.forEach(f => {
        //             f["id"] = regionKey;
        //         });
        //         // geojson["features"].push(...dataGeo[regionKey]);
        //         z.push(n);
        //         // ids.add(regionKey);

        //         data.push({
        //             type: "choroplethmapbox",
        //             // locationmode: 'geojson-id',
        //             colorscale: [[0, 'rgb(255,255,255)'], [1, 'rgb(0,0,255)']],
        //             locations: [regionKey],
        //             z: [n],
        //             geojson: dataGeo[regionKey],
        //             showscale: false,
        //             showlegend: true,
        //             name: regionKey
        //         })
        //         n = n + 1;

        //     }
        // })

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
            // locationmode: 'geojson-id',
            colorscale: [[0, 'rgb(255,255,255)'], [1, 'rgb(0,0,255)']],
            locations: this.props.currentBlock.config.metaData.regions,
            z: [1, 2],
            geojson: this.state.geoJsonData,
            showscale: false,
            showlegend: true,
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