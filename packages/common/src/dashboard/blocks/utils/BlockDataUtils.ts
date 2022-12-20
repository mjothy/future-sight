import BlockModel from "../../../models/BlockModel";
import ConfigurationModel from "../../../models/ConfigurationModel";

export function getControlBlock(blocks: BlockModel[], controlBlockId: string) {
    let controlBlock;
    if (controlBlockId !== '') {
        controlBlock = blocks[controlBlockId];
    }
    return controlBlock;
}

export function getUnselectedInputOptions(block: BlockModel, filtersId: string[]) {
    // Set inputs that still emplty
    const config = block.config as ConfigurationModel;
    if (config.metaData.selectOrder.length > 0) {
        const newOptions: string[] = [];
        filtersId.forEach((option) => {
            if (!config.metaData.selectOrder.includes(option)) {
                newOptions.push(option);
            }
        });
        return newOptions;
    } else {
        return filtersId;
    }
}

export function getChildrens(blocks, conyrolBlockId) {
    return Object.values(blocks).filter((block: BlockModel | any) => block.controlBlock === conyrolBlockId)
}