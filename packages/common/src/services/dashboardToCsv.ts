export default function dashboardToCsv(plotData: any[]) {
    let newValue: any = []
    Object.entries(plotData).forEach(([key, value]) => {
        value.forEach((item) => {
            let newItem = Object.assign({}, item)
            newItem.blockId = key
            delete newItem.data
            delete newItem.run
            item.data.forEach((timestep) => {
                newItem[timestep.year] = timestep.value
            })
            newItem.runId = item.run.id
            newItem.is_default = item.run.is_default
            newValue.push(newItem)
        })
    });
    return newValue
}
