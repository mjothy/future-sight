import * as fs from "fs";
import * as path from "path";

// Map into yaml files and map common regions
// 

const yaml = require('js-yaml');


const yamlFilePath = "D:/tmp/regions/";
const all: Promise<any>[] = []
const files = fs.readdirSync(yamlFilePath);
const yamlFile = {}
const regionsMapping = {}


function parseAndWrite(yamlFile: any, regionsMapping: any, dirPath: string, files: string[], i: number, resolve: (yamlFile: any, regionsMapping: any) => void) {
    const file = files[i];
    console.log("checking ", file)
    const filePath = path.join(dirPath, file);
    const yamlObj = yaml.load(fs.readFileSync(filePath, { encoding: 'utf-8' }));
    console.log("yamlObj: ", yamlObj);
}

const jsonFilePathOut = path.join(__dirname, "../data/out/yamlToJson.json");
const regionsMappingPath = path.join(__dirname, "../data/out/regionsMapping.json");
console.log(files)
parseAndWrite(yamlFile, regionsMapping, yamlFilePath, files, 0, (yamlFile, regionsMapping) => {

    fs.writeFileSync(jsonFilePathOut, JSON.stringify(yamlFile))
    fs.writeFileSync(regionsMappingPath, JSON.stringify(regionsMapping))

    console.log("done writing data")

})

