import IDataProxy from "./IDataProxy";
import * as fs from "fs";

export default class FSDataProxy implements IDataProxy {
    private readonly data: any[];
    private readonly testData: any[];
    private readonly models: object;
    private readonly regions: any[];
    private readonly variables: any[];

    constructor(dataPath: string, testDataPath: string, modelsPath: string, regionsPath: string, variablesPath: string) {
        let raw = fs.readFileSync(dataPath);
        this.data = JSON.parse(raw.toString());
        raw = fs.readFileSync(testDataPath)
        this.testData = JSON.parse(raw.toString());
        raw = fs.readFileSync(modelsPath)
        this.models = JSON.parse(raw.toString());
        raw = fs.readFileSync(regionsPath)
        this.regions = JSON.parse(raw.toString());
        raw = fs.readFileSync(variablesPath)
        this.variables = JSON.parse(raw.toString());
    }

    getData(): any[] {
        return this.data;
    }

    getModels(): object {
        return this.models;
    }

    getRegions(): any[] {
        return this.regions;
    }

    getTestData(): any[] {
        return this.testData;
    }

    getVariables(): any[] {
        return this.variables;
    }


}
