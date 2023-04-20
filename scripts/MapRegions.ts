import * as fs from "fs";
import * as path from "path";

// Map into yaml files and map common regions
// 

const yaml = require('js-yaml');


const yamlFilePath = "D:/tmp/regions/";
const all: Promise<any>[] = []
const files = fs.readdirSync(yamlFilePath);
const regionsMapping = {}


function parseAndWrite(regionsMapping: any, dirPath: string, files: string[], i: number, resolve: (regionsMapping: any) => void) {
    const file = files[i];
    const filePath = path.join(dirPath, file);
    const yamlObj = yaml.load(fs.readFileSync(filePath, { encoding: 'utf-8' }));
    // console.log("yamlObj: ", yamlObj);
    if (yamlObj['common_regions'] != null) {
        yamlObj['common_regions'].forEach((obj: any) => {
            Object.keys(obj).forEach(keyRegion => {
                regionsMapping[keyRegion] = obj[keyRegion];
            })
        })
    }
    // console.log("checking ", regionsMapping)
    fs.writeFile(regionsMappingPath, JSON.stringify(regionsMapping), { flag: 'w' }, function (err) {
        if (err)
            return console.error(err);
        fs.readFile(regionsMappingPath, 'utf-8', function (err, data) {
            if (err)
                return console.error(err);
            console.log(data);
        });
    });

}


const regionsMappingPath = path.join(__dirname, "../data/out/regionsMapping.json");
console.log(files)
parseAndWrite(regionsMapping, yamlFilePath, files, 0, (regionsMapping) => {

    // fs.writeFileSync(regionsMappingPath, JSON.stringify(regionsMapping))


    // console.log("done writing data")

})

