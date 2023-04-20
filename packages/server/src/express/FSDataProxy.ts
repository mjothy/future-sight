import IDataProxy from "./IDataProxy";
import * as fs from "fs";
import RegionsGeoJson from "./RegionsGeoJson";

const optionsLabel = ["models", "scenarios", "variables", "regions"];

export default class FSDataProxy implements IDataProxy {
    private readonly data: any[];
    private readonly dataUnion: any[];
    private readonly models: any;
    private readonly scenarios: any;
    private readonly variables: any;
    private readonly regions: any;
    private readonly geojson: any;


    constructor(dataPath: string, dataUnionPath: string, countriesGeojsonPath: string) {
        const dataRaw = fs.readFileSync(dataPath);
        const dataUnionRaw = fs.readFileSync(dataUnionPath);

        // this.data=[]
        // const dataPipeline = fs.createReadStream(dataPath).pipe(parser());
        // dataPipeline.on('data', dataElement => this.data.push(dataElement));
        // dataPipeline.on('end', () => console.log(`data parsed`));
        //
        this.data = JSON.parse(dataRaw.toString());
        this.dataUnion = JSON.parse(dataUnionRaw.toString());
        optionsLabel.forEach(option => {
            this[option] = Array.from(new Set(this.dataUnion.map(raw => raw[option.slice(0, -1)])))
        })

        const rg = new RegionsGeoJson(countriesGeojsonPath);
        this.geojson = rg.getRegionGeoJson();
    }

    getData(): any[] {
        return this.data;
    }

    getDataUnion() {
        return this.dataUnion;
    }

    getModels() {
        return this.models;
    }

    getScenarios() {
        return this.scenarios;
    }

    getVariables() {
        return this.variables;
    }

    getRegions() {
        return this.regions;
    }

    getGeojson(regions: string[] = []) {
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
    }
}
