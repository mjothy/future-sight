import IDataProxy from "./IDataProxy";
import * as fs from "fs";

export default class FSDataProxy implements IDataProxy {
    private readonly data: any[];
    private readonly models: object;

    constructor(dataPath: string, testDataPath: string, modelsPath: string, regionsPath: string, variablesPath: string) {
        let raw = fs.readFileSync(dataPath);
        this.data = JSON.parse(raw.toString());
        raw = fs.readFileSync(modelsPath)
        this.models = JSON.parse(raw.toString());
    }

    getData(): any[] {
        return this.data;
    }

    getModels(): object {
        return this.models;
    }
}
