import * as fs from "fs";
import * as csv from "csv";
import * as path from "path";
import {JsonStreamStringify} from 'json-stream-stringify';


function generateParser(json: object[], dataUnion: object[], id: string) {
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

            json.push({
                "model": Model,
                "scenario": Scenario,
                "version": Version ? Version : "1",
                "region": Region,
                "is_default": (is_default == undefined ? "True" : is_default),
                "variable": Variable,
                "unit": Unit,
                "data": dataParsed,
            });

            dataUnion.push({
                "model": Model,
                "scenario": Scenario,
                "variable": Variable,
                "region": Region,
                "version": Version ? Version : "1",
                "is_default": (is_default == undefined ? "True" : is_default),
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

function parseAndWrite(json: object[], dataUnion: object[], dirPath: string, files: string[], i: number,
                       resolve: (json: object[], dataUnion: object[]) => void) {
    const file = files[i];
    console.log("checking ", file)
    const parser = generateParser(json, dataUnion, file)
    const filePath = path.join(dirPath, file);
    fs.createReadStream(filePath).pipe(parser).on("end", () => {
        console.log(json.length)
        if (files.length > (i + 1)) {
            parseAndWrite(json, dataUnion, dirPath, files, i + 1, resolve);
        } else {
            resolve(json, dataUnion);
        }
    });
}

const json: object[] = []
const dataUnion: object[] = []


const jsonFilePath = path.join(__dirname, "../data/out/data.json");
const dataUnionFilePath = path.join(__dirname, "../data/out/dataUnion.json");

const csvFilePath = "D:\\tmp\\data-consortium";

const files = fs.readdirSync(csvFilePath);
parseAndWrite(json, dataUnion, csvFilePath, files, 0, (json, dataUnion) => {

    fs.writeFileSync(jsonFilePath, JSON.stringify(json))
    console.log("done writing data")

    fs.writeFileSync(dataUnionFilePath, JSON.stringify(dataUnion))
    console.log("done writing dataUnion")
})
