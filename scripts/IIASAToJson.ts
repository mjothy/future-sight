import * as fs from "fs";
import * as csv from "csv";
import * as path from "path";
import { JsonStreamStringify } from 'json-stream-stringify';

function generateParser(json: object[], models: any, scenarios: any, variables: any, regions: any, id: string) {
    const parser = csv.parse({
        columns: true,
        delimiter: ',',
    });
    // Use the readable stream api to consume records
    parser.on('readable', function () {
        let record;
        while ((record = parser.read()) !== null) {
            const { Model, Scenario, Region, Variable, Unit, ...data } = record;
            const dataParsed: any[] = [];
            for (const key in data) {
                dataParsed.push({ "year": key, "value": data[key] });
            }

            // Set models.json
            if (!(Model in models)) {
                models[Model] = {
                    variables: new Set(),
                    regions: new Set(),
                    scenarios: new Set()
                };
            }

            models[Model].regions.add(Region)
            models[Model].variables.add(Variable)
            models[Model].scenarios.add(Scenario)

            // Set scenarios.json
            if (!(Scenario in scenarios)) {
                scenarios[Scenario] = {
                    variables: new Set(),
                    regions: new Set(),
                    models: new Set()
                };
            }

            scenarios[Scenario].regions.add(Region)
            scenarios[Scenario].variables.add(Variable)
            scenarios[Scenario].models.add(Model)


            // Set variables.json
            if (!(Variable in variables)) {
                variables[Variable] = {
                    scenarios: new Set(),
                    regions: new Set(),
                    models: new Set()
                };
            }

            variables[Variable].regions.add(Region)
            variables[Variable].scenarios.add(Scenario)
            variables[Variable].models.add(Model)

            // Set regions.json
            if (!(Region in regions)) {
                regions[Region] = {
                    scenarios: new Set(),
                    variables: new Set(),
                    models: new Set()
                };
            }

            regions[Region].scenarios.add(Scenario)
            regions[Region].variables.add(Variable)
            regions[Region].models.add(Model)

            json.push({
                "model": Model,
                "scenario": Scenario,
                "region": Region,
                "variable": Variable,
                "unit": Unit,
                "data": dataParsed
            });
        }
    });
    // Catch any error
    parser.on('error', function (err) {
        console.error(err.message);
    });
    parser.on('close', () => {
        console.log("done", id)
    })
    return parser;
}
function parseAndWrite(json: object[], models: any, scenarios: any, variables: any, regions: any, dirPath: string, files: string[], i: number, resolve: (json: object[], models: any, scenarios: any, variables: any, regions: any) => void) {
    const file = files[i];
    console.log("checking ", file)
    const parser = generateParser(json, models, scenarios, variables, regions, file)
    const filePath = path.join(dirPath, file);
    fs.createReadStream(filePath).pipe(parser).on("end", () => {
        console.log(json.length)
        if (files.length > (i + 1)) {
            parseAndWrite(json, models, scenarios, variables, regions, dirPath, files, i + 1, resolve);
        } else {
            resolve(json, models, scenarios, variables, regions);
        }
    });
}

const json: object[] = []
const models: any = {}
const scenarios: any = {}
const variables: any = {}
const regions: any = {}



const jsonFilePath = path.join(__dirname, "../data/out/data1.json");
const modelsFilePath = path.join(__dirname, "../data/out/models.json");
const scenariosFilePath = path.join(__dirname, "../data/out/scenarios.json");
const variablesFilePath = path.join(__dirname, "../data/out/varibales.json");
const regionsFilePath = path.join(__dirname, "../data/out/regions.json");

const csvFilePath = "D:/tmp/data/";

const all: Promise<any>[] = []
const files = fs.readdirSync(csvFilePath);
parseAndWrite(json, models, scenarios, variables, regions, csvFilePath, files, 0, (json, models, scenarios, variables, regions) => {
    console.log("done all files")
    const streamJsonM = new JsonStreamStringify(models,
        (key: any, value: any) => value instanceof Set ? Array.from(value) : value);
    const fileStreamM = fs.createWriteStream(modelsFilePath);
    streamJsonM.pipe(fileStreamM).on("finish", () => {
        console.log("done writing models")
    })

    // scenarios
    const streamJsonS = new JsonStreamStringify(scenarios,
        (key: any, value: any) => value instanceof Set ? Array.from(value) : value);
    const fileStreamS = fs.createWriteStream(scenariosFilePath);
    streamJsonS.pipe(fileStreamS).on("finish", () => {
        console.log("done writing models")
    })

    // variables
    const streamJsonV = new JsonStreamStringify(variables,
        (key: any, value: any) => value instanceof Set ? Array.from(value) : value);
    const fileStreamV = fs.createWriteStream(variablesFilePath);
    streamJsonV.pipe(fileStreamV).on("finish", () => {
        console.log("done writing models")
    })

    // regions
    const streamJsonR = new JsonStreamStringify(regions,
        (key: any, value: any) => value instanceof Set ? Array.from(value) : value);
    const fileStreamR = fs.createWriteStream(regionsFilePath);
    streamJsonR.pipe(fileStreamR).on("finish", () => {
        console.log("done writing models")
    })

    fs.writeFileSync(jsonFilePath, JSON.stringify(json))
    console.log("done writing data")
    /*
    const streamJson = new JsonStreamStringify(json);
    const fileStream =  fs.createWriteStream(jsonFilePath);
    streamJson.pipe(fileStream).on("finish", () => {
        console.log("done writing data")
    })
    */
})
