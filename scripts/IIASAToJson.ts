import * as fs from "fs";
import * as csv from "csv";
import * as path from "path";
import { JsonStreamStringify } from 'json-stream-stringify';

function generateParser(json: object[], models: any, id: string) {
    const parser = csv.parse({
        columns: true,
        delimiter: ',',
    });
// Use the readable stream api to consume records
    parser.on('readable', function(){
        let record;
        while ((record = parser.read()) !== null) {
            const {Model, Scenario, Region, Variable, Unit, ...data} = record;
            const dataParsed = [];
            for (const key in data) {
                dataParsed.push({"year": key, "value": data[key]});
            }
            if(!(Model in models)) {
                models[Model] = {};
            }
            if(!(Scenario in models[Model])) {
                models[Model][Scenario] = {
                    "regions": new Set(),
                    "variables" : new Set()
                };
            }
            if(!(Region in models[Model][Scenario]["regions"])) {
                models[Model][Scenario]["regions"].add(Region)
            }
            if(!(Variable in models[Model][Scenario]["variables"])) {
                models[Model][Scenario]["variables"].add(Variable)
            }
            json.push({
                "model": Model,
                "scenario": Scenario,
                "region": Region,
                "variable": Variable,
                "unit": Unit,
                "data" : dataParsed
            });
        }
    });
// Catch any error
    parser.on('error', function(err){
        console.error(err.message);
    });
    parser.on('close', () => {
        console.log("done", id)
    })
    return parser;
}
function parseAndWrite(json: object[], models: any, dirPath: string, files: string[],i: number, resolve: (json: object[], models: any) => void) {
    const file = files[i];
    console.log("checking ", file)
    const parser = generateParser(json, models, file)
    const filePath = path.join(dirPath, file);
    fs.createReadStream(filePath).pipe(parser).on("end", () => {
        console.log(json.length)
        if (files.length > (i+1)) {
            parseAndWrite(json, models, dirPath, files, i+1, resolve);
        } else {
            resolve(json, models);
        }
    });
}

const json: object[] = []
const models: any = {}

const jsonFilePath = path.join(__dirname, "../data/out/data1.json");
const modelsFilePath = path.join(__dirname, "../data/out/models.json");
const csvFilePath = "D:/tmp/data/";

const all: Promise<any>[] = []
const files = fs.readdirSync(csvFilePath);
parseAndWrite(json, models, csvFilePath, files, 0, (json, models) => {
    console.log("done all files")
    const streamJsonM = new JsonStreamStringify(models,
        (key: any, value: any) => value instanceof Set ? Array.from(value) : value);
    const fileStreamM =  fs.createWriteStream(modelsFilePath);
    streamJsonM.pipe(fileStreamM).on("finish", () => {
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
