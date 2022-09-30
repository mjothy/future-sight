import IDataProxy from "./IDataProxy";
import * as fs from "fs";

export default class FSDataProxy implements IDataProxy {
    private readonly data: any[];
    private readonly models: any;
    private readonly scenarios: any;
    private readonly variables: any;
    private readonly regions: any;


    constructor(dataPath: string, modelsPath: string, scenariosPath: string, variablesPath: string, regionsPath: string) {
        const dataRaw = fs.readFileSync(dataPath);
        const modelsRaw = fs.readFileSync(modelsPath);
        const scenariosRaw = fs.readFileSync(scenariosPath);
        const variablesRaw = fs.readFileSync(variablesPath);
        const regionsRaw = fs.readFileSync(regionsPath);

        this.data = JSON.parse(dataRaw.toString());
        this.models = JSON.parse(modelsRaw.toString());
        this.scenarios = JSON.parse(scenariosRaw.toString());
        this.variables = JSON.parse(variablesRaw.toString());
        this.regions = JSON.parse(regionsRaw.toString());


    }

    getData(): any[] {
        return this.data;
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
