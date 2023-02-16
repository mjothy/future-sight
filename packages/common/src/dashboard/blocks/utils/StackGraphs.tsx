
const keys = ["models", "scenarios", "variables", "regions"];

// function isComplexity(metaData) {
//     let nb_complecity = 0;
//     keys.forEach(key => {
//         if (metaData[key].length > 1) {
//             nb_complecity = nb_complecity + 1;
//         }
//     })

//     return nb_complecity > 1;
// }

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

export function stackGroups(metaData, stackBy) {
    const stacks: any = []

    if (stackBy != undefined) {
        const arr: any = [];
        const keysWithoutStack = keys.filter(key => key != stackBy);
        keysWithoutStack.forEach(key => {
            arr.push(metaData[key]);
        })
        const allPossibleCombinaison = combineAll(arr);
        allPossibleCombinaison.forEach(raw => {
            // 
            const obj = {}
            for (let i = 0; i < keysWithoutStack.length; i++) {
                obj[keysWithoutStack[i]] = raw[i];
            }
            const arrInStack: any = [];
            metaData[stackBy].forEach(valueStack => {
                const newObj = { ...obj }
                newObj[stackBy] = valueStack;
                arrInStack.push(newObj);
            })
            stacks.push([...arrInStack])
        });
        console.log("arr: ", stacks);
    }
    return stacks;
}