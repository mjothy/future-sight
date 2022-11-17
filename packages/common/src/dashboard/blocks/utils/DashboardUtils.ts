import DashboardModel from "../../../models/DashboardModel";

export function getSelectedFilter(dashboard: DashboardModel) {
    const filterOptions = Object.keys(dashboard.dataStructure)
        .filter((key) => dashboard.dataStructure[key].isFilter)
        .map((key) => key);
    return filterOptions.length > 0 ? filterOptions[0] : '';
}