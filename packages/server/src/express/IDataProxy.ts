export default interface IDataProxy {
    getData: () => any[];
    getDataUnion: () => any[];
    getModels: () => any;
    getVariables: () => any;
    getScenarios: () => any;
    getRegions: () => any;
    getGeojson: (regions: string[]) => any;
    getCategories:() => any
}
