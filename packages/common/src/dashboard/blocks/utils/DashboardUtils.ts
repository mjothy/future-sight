import BlockModel from "../../../models/BlockModel";
import DataStructureModel from "../../../models/DataStructureModel";

export function getSelectedFiltersLabels(dataStructure: DataStructureModel) {
    const filterOptions = Object.keys(dataStructure)
        .filter((key) => dataStructure[key].isFilter)
        .map((key) => key);
    return filterOptions ? filterOptions : [];
}

export function compareDataStructure(dataStructure, newDataStructure) {
    let res = false;
    Object.keys(dataStructure).forEach(option => {
        if (dataStructure[option].isFilter !== newDataStructure[option].isFilter || dataStructure[option].selection.length !== newDataStructure[option].selection.length) {
            res = true;
        } else {
            dataStructure[option].selection.forEach(value => {
                if (!newDataStructure[option].selection.includes(value)) {
                    res = true;
                }
            })
        }
    })
    return res;
}

/**
 * @param blocks All blocks of current dashboard
 * @param dataStructure contains data from the first filter (data focus)
 * @returns array of blocks id that not contains data from data focus
 */
export function blocksIdToDelete(blocks, dataStructure) {
    const selectedFilter = getSelectedFiltersLabels(dataStructure);
    const toDeleteBlocks = new Set<string>();

    selectedFilter.forEach(filter => {
        if (dataStructure[filter].selection.length > 0) {
            blocks.forEach((block: BlockModel | any) => {
                if (block.blockType !== "text") {
                    block.config.metaData[filter].forEach(value => {
                        if (!dataStructure[filter].selection.includes(value)) {
                            toDeleteBlocks.add(block.id);
                        }
                    })
                }
            });
        }
    })

    return toDeleteBlocks;
}