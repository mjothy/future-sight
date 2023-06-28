import RegionsGeoJson from "./RegionsGeoJson";
import IConfigurationProvider from "../interfaces/IConfigurationProvider";
import * as fs from "fs";


export default class FSConfigurationProvider implements IConfigurationProvider {

    private readonly geojson: any;
    private readonly categorie: any;

    constructor(countriesGeojsonPath: string, categoriesPath: string) {
        const rg = new RegionsGeoJson(countriesGeojsonPath);
        const categoriesRaw = fs.readFileSync(categoriesPath);

        this.geojson = rg.getRegionGeoJson();
        this.categorie = JSON.parse(categoriesRaw.toString());

    }
    getMetaIndicators = () => {
        return this.categorie
    };

    getGeojson = (regions: string[]) => {
        const geojsonResult: { type: string, features: any } = {
            type: "FeatureCollection",
            features: []
        };
        regions.forEach(region => {
            const geojson = this.geojson[region.toLowerCase()]
            if (geojson != null) {
                geojson["id"] = region;
                geojsonResult.features.push(geojson);
            }
        });
        return geojsonResult;
    };

}