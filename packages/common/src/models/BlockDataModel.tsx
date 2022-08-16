
export default class BlockDataModel {
    /**
     * The key is the model name, and data is table lf scenarios
     */
    models:{ [id: string] : string[] } = {};
    regions:string[] = [];
    variables:string[] = [];
}