
export function currentFilter(dashboard) {
    const dataStructure = dashboard.dataStructure;
    const filterOptions = Object.keys(dataStructure)
        .filter((key) => dataStructure[key].isFilter)
        .map((key) => key);
    return filterOptions;
}
