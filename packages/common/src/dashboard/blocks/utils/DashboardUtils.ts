import DataStructureModel from "../../../models/DataStructureModel";

export function getSelectedFilter(dataStructure: DataStructureModel) {
    const filterOptions = Object.keys(dataStructure)
        .filter((key) => dataStructure[key].isFilter)
        .map((key) => key);
    return filterOptions.length > 0 ? filterOptions[0] : '';
}