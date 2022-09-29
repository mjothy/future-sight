export default interface IDataProxy {
    getData: () => any[];
    getModels: () => string[];
    getVariables: () => string[];
    getScenarios: () => string[];
    getRegions: () => string[];
}
