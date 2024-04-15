
const keys = ["models", "scenarios", "variables", "regions"];

/**
 * Generating combinations from n arrays with m elements in JavaScript
 * Source: https://www.tutorialspoint.com/generating-combinations-from-n-arrays-with-m-elements-in-javascript
 * @param array 
 * @returns array of all possible combinaison
 */
function combineAll(array) {
    const res: any = [];
    const max = array.length - 1;
    const helper = (arr, i) => {
        for (let j = 0, l = array[i].length; j < l; j++) {
            const copy = arr.slice(0);
            copy.push(array[i][j]);
            if (i == max)
                res.push(copy);
            else
                helper(copy, i + 1);
        }
    };
    helper([], 0);
    return res;
}

/**
 * 
 * @param metaData the block selected data
 * @param stackBy the stack by option
 * @returns stacks group [[{},{}], [{},{},{}]]
 */
export function stackGroups(metaData, stackBy) {
    const stacks: any = []

    if (stackBy != undefined && stackBy != "") {
        const arr: any = [];
        const keysWithoutStack = keys.filter(key => key != stackBy);
        keysWithoutStack.forEach(key => {
            arr.push(metaData[key]);
        })
        const allPossibleCombinaison = combineAll(arr);
        allPossibleCombinaison.forEach(raw => {
            const obj = {}
            for (let i = 0; i < keysWithoutStack.length; i++) {
                obj[keysWithoutStack[i]] = raw[i];
            }
            const arrInStack: any = [];
            metaData[stackBy].forEach(valueStack => {
                arrInStack.push({
                    [stackBy]:valueStack,
                    ...obj
                });
            })
            stacks.push([...arrInStack])
        });
    }
    return stacks;
}


/**
 *
 * @param metaData the block selected data
 * @param stackBy the stack by option
 * @returns stacks group [[{},{}], [{},{},{}]]
 */
export function groupByGroups(metaData, groupBy) {
    const groups: any = []

    if (groupBy != undefined && groupBy != "") {
        const arr: any = [];
        const keysWithoutStack = keys.filter(key => key != groupBy);
        keysWithoutStack.forEach(key => {
            arr.push(metaData[key]);
        })
        const allPossibleCombinaison = combineAll(arr); // same as indexes
        metaData[groupBy].forEach(valueStack => {
            const arrInStack: any = [];
            allPossibleCombinaison.forEach(comb => {
                const obj = {}
                for (let i = 0; i < keysWithoutStack.length; i++) {
                    obj[keysWithoutStack[i]] = comb[i];
                }
                arrInStack.push({
                    [groupBy]:valueStack,
                    ...obj
                });
            })
            groups.push([...arrInStack])
        });
    }
    return groups;
}