import IDataProxy from "./IDataProxy";
import * as fs from "fs";
import {parser} from 'stream-json/Parser';

const optionsLabel = ["models", "scenarios", "variables", "regions"];

export default class FSDataProxy implements IDataProxy {
    private readonly data: any[];
    private readonly dataUnion: any[];
    private readonly models: any;
    private readonly scenarios: any;
    private readonly variables: any;
    private readonly regions: any;


    constructor(dataPath: string, dataUnionPath: string) {
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
