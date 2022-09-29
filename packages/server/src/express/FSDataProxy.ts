import IDataProxy from "./IDataProxy";
import * as fs from "fs";

export default class FSDataProxy implements IDataProxy {
    private readonly data: any[];
    private readonly models = new Set<string>();
    private readonly scenarios = new Set<string>();
    private readonly variables = new Set<string>();
    private readonly regions = new Set<string>();


    constructor(dataPath: string) {
        const raw = fs.readFileSync(dataPath);
        this.data = JSON.parse(raw.toString());
        this.data.forEach((data) => {
            this.models.add(data.model);
            this.scenarios.add(data.scenario);
            this.variables.add(data.variable);
            this.regions.add(data.region);
        });

    }

    getData(): any[] {
        return this.data;
    }

    getModels(): string[] {
        return Array.from(this.models);
    }

    getScenarios(): string[] {
        return Array.from(this.scenarios);
    }

    getVariables(): string[] {
        return Array.from(this.variables);
    }

    getRegions(): string[] {
        return Array.from(this.regions);
    }
}
