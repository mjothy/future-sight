import IDataProxy from "./IDataProxy";
import * as fs from "fs";

export default class FSDataProxy implements IDataProxy {
    private readonly data: any[];
    private readonly dataUnion: any[];
    private readonly models: any;
    private readonly scenarios: any;
    private readonly variables: any;
    private readonly regions: any;


    constructor(dataPath: string, dataUnionPath: string, modelsPath: string, scenariosPath: string, variablesPath: string, regionsPath: string) {
        const dataRaw = fs.readFileSync(dataPath);
        const dataUnionRaw = fs.readFileSync(dataUnionPath);
        const modelsRaw = fs.readFileSync(modelsPath);
        const scenariosRaw = fs.readFileSync(scenariosPath);
        const variablesRaw = fs.readFileSync(variablesPath);
        const regionsRaw = fs.readFileSync(regionsPath);

        this.data = JSON.parse(dataRaw.toString());
        this.dataUnion = JSON.parse(dataUnionRaw.toString());
        this.models = JSON.parse(modelsRaw.toString());
        this.scenarios = JSON.parse(scenariosRaw.toString());
        this.variables = JSON.parse(variablesRaw.toString());
        this.regions = JSON.parse(regionsRaw.toString());


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
}
