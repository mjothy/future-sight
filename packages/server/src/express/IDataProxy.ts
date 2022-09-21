export default interface IDataProxy {
    getTestData: () => any[];
    getData: () => any[];
    getModels: () => object;
    getRegions: () => any[];
    getVariables: () => any[];
}
