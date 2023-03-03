import * as fs from "fs";
import * as csv from "csv";
import * as path from "path";
import {JsonStreamStringify} from 'json-stream-stringify';


function generateParser(json: object[], dataUnion: object[], models: any, scenarios: any, variables: any, regions: any, id: string) {
    const parser = csv.parse({
        columns: true,
        delimiter: ',',
    });
    // Use the readable stream api to consume records
    parser.on('readable', function () {
        let record;
        while ((record = parser.read()) !== null) {
            const {Model, Scenario, Version, Region, Variable, Unit, is_default, ...data} = record;
            const dataParsed: any[] = [];
            for (const key in data) {
                dataParsed.push({"year": key, "value": data[key]});
            }

            // // Set models.json
            // if (!(Model in models)) {
            //     models[Model] = {
            //         variables: new Set(),
            //         regions: new Set(),
            //         scenarios: new Set()
            //     };
            // }

            // models[Model].regions.add(Region)
            // models[Model].variables.add(Variable)
            // models[Model].scenarios.add(Scenario)

            // // Set scenarios.json
            // if (!(Scenario in scenarios)) {
            //     scenarios[Scenario] = {
            //         variables: new Set(),
            //         regions: new Set(),
            //         models: new Set()
            //     };
            // }

            // scenarios[Scenario].regions.add(Region)
            // scenarios[Scenario].variables.add(Variable)
            // scenarios[Scenario].models.add(Model)


            // // Set variables.json
            // if (!(Variable in variables)) {
            //     variables[Variable] = {
            //         scenarios: new Set(),
            //         regions: new Set(),
            //         models: new Set()
            //     };
            // }

            // variables[Variable].regions.add(Region)
            // variables[Variable].scenarios.add(Scenario)
            // variables[Variable].models.add(Model)

            // // Set regions.json
            // if (!(Region in regions)) {
            //     regions[Region] = {
            //         scenarios: new Set(),
            //         variables: new Set(),
            //         models: new Set()
            //     };
            // }

            // regions[Region].scenarios.add(Scenario)
            // regions[Region].variables.add(Variable)
            // regions[Region].models.add(Model)

            json.push({
                "model": Model,
                "scenario": Scenario,
                "version": Version,
                "region": Region,
                "is_default": is_default,
                "variable": Variable,
                "unit": Unit,
                "data": dataParsed,
            });

            dataUnion.push({
                "model": Model,
                "scenario": Scenario,
                "variable": Variable,
                "region": Region,
                "version": Version,
                "is_default": is_default,
            })
        }
    });
    // Catch any error
    parser.on('error', function (err) {
        console.error(err.message);
    });
    parser.on('end', () => {
        console.log("done", id)
    })
    return parser;
}

function parseAndWrite(json: object[], dataUnion: object[], models: any, scenarios: any, variables: any, regions: any, dirPath: string, files: string[], i: number, resolve: (json: object[], dataUnion: object[], models: any, scenarios: any, variables: any, regions: any) => void) {
    const file = files[i];
    console.log("checking ", file)
    const parser = generateParser(json, dataUnion, models, scenarios, variables, regions, file)
    const filePath = path.join(dirPath, file);
    fs.createReadStream(filePath).pipe(parser).on("end", () => {
        console.log(json.length)
        if (files.length > (i + 1)) {
            parseAndWrite(json, dataUnion, models, scenarios, variables, regions, dirPath, files, i + 1, resolve);
        } else {
            resolve(json, dataUnion, models, scenarios, variables, regions);
        }
    });
}

const json: object[] = []
const dataUnion: object[] = []
const models: any = {}
const scenarios: any = {}
const variables: any = {}
const regions: any = {}


const jsonFilePath = path.join(__dirname, "../data/out/data.json");
const dataUnionFilePath = path.join(__dirname, "../data/out/dataUnion.json");
const modelsFilePath = path.join(__dirname, "../data/out/models.json");
const scenariosFilePath = path.join(__dirname, "../data/out/scenarios.json");
const variablesFilePath = path.join(__dirname, "../data/out/variables.json");
const regionsFilePath = path.join(__dirname, "../data/out/regions.json");

// const csvFilePath = "D:/tmp/data/"; // Used only a fraction of the dataset, files too big to be used directly on RAM
const csvFilePath = "D:/projet/ecemf/data/data_raw/with_version_sample";

const all: Promise<any>[] = []
const files = fs.readdirSync(csvFilePath);
parseAndWrite(json, dataUnion, models, scenarios, variables, regions, csvFilePath, files, 0, (json, dataUnion, models, scenarios, variables, regions) => {
    console.log("done all files")
    // const streamJsonM = new JsonStreamStringify(models,
    //     (key: any, value: any) => value instanceof Set ? Array.from(value) : value);
    // const fileStreamM = fs.createWriteStream(modelsFilePath);
    // streamJsonM.pipe(fileStreamM).on("finish", () => {
    //     console.log("done writing models")
    // })

    // // scenarios
    // const streamJsonS = new JsonStreamStringify(scenarios,
    //     (key: any, value: any) => value instanceof Set ? Array.from(value) : value);
    // const fileStreamS = fs.createWriteStream(scenariosFilePath);
    // streamJsonS.pipe(fileStreamS).on("finish", () => {
    //     console.log("done writing models")
    // })

    // // variables
    // const streamJsonV = new JsonStreamStringify(variables,
    //     (key: any, value: any) => value instanceof Set ? Array.from(value) : value);
    // const fileStreamV = fs.createWriteStream(variablesFilePath);
    // streamJsonV.pipe(fileStreamV).on("finish", () => {
    //     console.log("done writing models")
    // })

    // // regions
    // const streamJsonR = new JsonStreamStringify(regions,
    //     (key: any, value: any) => value instanceof Set ? Array.from(value) : value);
    // const fileStreamR = fs.createWriteStream(regionsFilePath);
    // streamJsonR.pipe(fileStreamR).on("finish", () => {
    //     console.log("done writing models")
    // })

    // const streamJson = new JsonStreamStringify(json);
    // const fileStream = fs.createWriteStream(jsonFilePath);
    // streamJson.pipe(fileStream).on("finish", () => {
    //     console.log("done writing data")
    // })

    fs.writeFileSync(jsonFilePath, JSON.stringify(json))
    console.log("done writing data")

    fs.writeFileSync(dataUnionFilePath, JSON.stringify(dataUnion))
    console.log("done writing dataUnion")
})
