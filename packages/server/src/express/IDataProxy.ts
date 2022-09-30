export default interface IDataProxy {
    getData: () => any[];
    getModels: () => any;
    getVariables: () => any;
    getScenarios: () => any;
    getRegions: () => any;
}
