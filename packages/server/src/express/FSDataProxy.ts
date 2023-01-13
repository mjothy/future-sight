import IDataProxy from "./IDataProxy";
import * as fs from "fs";

const optionsLabel = ["models", "scenarios", "variables", "regions"];

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

        this.data = JSON.parse(dataRaw.toString());
        this.dataUnion = JSON.parse(dataUnionRaw.toString());
        optionsLabel.forEach(option => {
            this[option] = Array.from(new Set(this.dataUnion.map(raw => raw[option.slice(0, -1)])))
        })

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
