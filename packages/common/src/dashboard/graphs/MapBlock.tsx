import React, { Component } from 'react';
import Plot from 'react-plotly.js';

export default class MapBlock extends Component<any, any> {


    async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): Promise<void> {
        const geoJsonData = await this.props.dataManager.fetchRegionsMapping({ regions: this.props.data.regions });
        console.log("geoJsonData: ", geoJsonData)
        console.log("regions: ", this.props.data.regions)
    }

    render() {

        // const data = [{
        //     type: "choroplethmapbox",
        //     // geojson: 
        // }];

        // const layout = {
        //     dragmode: "zoom",
        //     mapbox: { style: "carto-positron", center: { lat: 38, lon: -90 }, zoom: 3 },
        //     margin: { r: 0, t: 0, b: 0, l: 0 },
        //     width: this.props.width,
        //     height: this.props.height,
        // };

        let layout: any = {
            width: this.props.width,
            height: this.props.height,
            font: {
                size: 10,
            },
            dragmode: "zoom",
            mapbox: { style: "carto-positron", center: { lat: 38, lon: -90 }, zoom: 3 },
            margin: { r: 0, t: 30, b: 20, l: 0 },
        };
        if (this.props.currentBlock.config.configStyle.title.isVisible) {
            layout = {
                ...layout,
                title: this.props.currentBlock.config.configStyle.title.value,
            };
        }

        const data = [{
            type: this.props.data.type,
            // geojson: 
        }]

        return (
            <Plot
                data={data}
                layout={layout}
            />
        )
    }
}