import React, { useRef, useEffect, useState, Component, createRef } from 'react';
import maplibregl from 'maplibre-gl';
import { any } from 'prop-types';
// import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapBlockProps {
    width: number,
    height: number
}



export default class MapBlock extends Component<any, any> {
    mapContainer;
    constructor(props) {
        super(props);
        this.mapContainer = React.createRef();
        this.state = {
            map: createRef(),
            dim: {
                lng: 16.05,
                lat: 48
            },
            zoom: 2.9,
            API_KEY: 'v5Ya04pJiHoCWy2YcZRB'
        }
    }

    componentDidMount(): void {
        console.log("call use effect")

        // if (map.current) return;
        this.setState(state => {
            state.map.current = new maplibregl.Map({
                container: this.mapContainer.current,
                style: `https://api.maptiler.com/maps/basic/style.json?key=${state.API_KEY}`,
                center: [state.dim.lng, state.dim.lat],
                zoom: state.zoom,
            });
            state.map.current.on('load', function () {
                state.map.current.addSource('states', {
                    'type': 'geojson',
                    'data':
                        'https://maplibre.org/maplibre-gl-js-docs/assets/us_states.geojson'
                });

                // The feature-state dependent fill-opacity expression will render the hover effect
                // when a feature's hover state is set to true.
                state.map.current.addLayer({
                    'id': 'state-fills',
                    'type': 'fill',
                    'source': 'states',
                    'layout': {},
                    'paint': {
                        'fill-color': '#627BC1',
                        'fill-opacity': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            1,
                            0.5
                        ]
                    }
                });

                state.map.current.addLayer({
                    'id': 'state-borders',
                    'type': 'line',
                    'source': 'states',
                    'layout': {},
                    'paint': {
                        'line-color': '#627BC1',
                        'line-width': 2
                    }
                });

                // When the user moves their mouse over the state-fill layer, we'll update the
                // feature state for the feature under the mouse.
                state.map.current.on('mousemove', 'state-fills', function (e) {
                    // SHOW data
                });

                // When the mouse leaves the state-fill layer, update the feature state of the
                // previously hovered feature.
                state.map.current.on('mouseleave', 'state-fills', function () {
                    // unshowed data
                });
            });

            return state;
        })
    }

    render() {
        return (
            <div style={{ height: this.props.height, width: this.props.width }}>
                <div ref={this.mapContainer} style={{ height: "80%", width: "100%" }} />
            </div>
        )
    }
}