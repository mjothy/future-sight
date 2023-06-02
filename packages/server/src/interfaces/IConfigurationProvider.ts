

export default interface IConfigurationProvider {
    getGeojson: (regions: string[]) => any;
    getMetaIndicators : () => any;
    //getServerConfiguration(... IASAurl, ...)
}