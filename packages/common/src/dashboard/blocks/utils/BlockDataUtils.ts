import BlockModel from "../../../models/BlockModel";

export function getControlBlock(blocks: BlockModel[], controlBlockId: string) {
    console.log(blocks, 'controlBlockId', controlBlockId);
    let controlBlock = new BlockModel();
    if (controlBlockId !== '') {
        controlBlock = blocks[controlBlockId];
    }
    return controlBlock;
}