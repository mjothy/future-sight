import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapBlockProps {
    width: number,
    height: number
}

export default function MapBlock(props: MapBlockProps) {
    const mapContainer = useRef(null as any);
    const map = useRef(null as any);
    const [lng] = useState(139.753);
    const [lat] = useState(35.6844);
    const [zoom] = useState(14);
    const [API_KEY] = useState('v5Ya04pJiHoCWy2YcZRB');

    useEffect(() => {
        if (map.current) return;
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
            center: [lng, lat],
            zoom: zoom,
            // heigth: props.height,
            // width: props.width
        });

        console.log("call use effect")
    });

    return (
        <div style={{ height: props.height, width: props.width }}>
            <div ref={mapContainer} style={{ height: "100%", width: "100%" }} />
        </div>
    );
}