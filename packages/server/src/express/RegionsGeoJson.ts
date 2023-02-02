import IDataProxy from "./IDataProxy";

export default class RegionsGeoJson {

    private readonly dataProxy: IDataProxy;
    private regionsMapping: any;

    constructor(regions, dataProxy: IDataProxy) {
        this.dataProxy = dataProxy;
        this.regionsMapping = this.getRegionsMapping(regions);
    }


    /**
     * Get the countries of regions
     * @param regions 
     * @returns  
     */
    getRegionsMapping = (regions) => {
        const regionsMapping = this.dataProxy.getRegionsMapping();
        const resultMapping = {};
        regions?.forEach(region => {
            const regionExist = Object.keys(regionsMapping)?.find(regionMap => regionMap.trim().toLowerCase() == region.trim().toLowerCase())
            if (regionExist != undefined) {
                resultMapping[regionExist] = regionsMapping[regionExist]
            }
        });
        return resultMapping;
    }

    /**
     * 
     * @returns {keyRegion: geojsonObject}
     */
    getRegionGeoJson = () => {
        const countriesGeojson = this.dataProxy.getCountriesGeojson();
        const { type, features } = countriesGeojson;
        const regions = this.regionsMapping;
        const geojsonResult: { type: string, features: any } = {
            type,
            features: []
        };

        //TODO add dictionary to store the result of this.dataProxy.getCountriesGeojson() (to avoid calling the large file after each endpoint call)
        Object.entries(regions).forEach(([region, countries]) => {
            const geojson = features.filter(feature => (countries as string[]).includes(feature["properties"]["ADMIN"]) || (countries as string[]).includes(feature["properties"]["ISO_A3"]));
            geojson.map(obj => obj["id"] = region);

            console.log("geojson: ", geojson);
            geojsonResult.features.push(...geojson);
        });

        return geojsonResult;
    }
}