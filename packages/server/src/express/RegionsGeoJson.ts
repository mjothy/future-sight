import * as fs from "fs";

export default class RegionsGeoJson {

    /** from json object to dictionary {coutry: geojson} */
    private readonly geojsonTransform: any = {};

    constructor(geojsonFile) {
        const geojsonObj = fs.readFileSync(geojsonFile);
        const geojson = JSON.parse(geojsonObj.toString());
        geojson.features.forEach(feature => {
            const contryName = feature["properties"]["ADMIN"];
            this.geojsonTransform[contryName.toLowerCase()] = feature;
        })
    }

    /**
     * @returns {keyCountry: geojsonObject}
     */
    getRegionGeoJson = () => {
        return this.geojsonTransform;
    }
}