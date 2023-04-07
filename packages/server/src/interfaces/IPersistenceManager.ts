
import { DashboardModel } from "@future-sight/common";
import BrowseObject from "../models/BrowseObject";

export default interface IPersistenceManager {
    saveDashboard: (dashboard: DashboardModel) => any;
    getDashboardById: (id) => Promise<DashboardModel | null>;
    getAllDashboards: () => Promise<DashboardModel[]>;
    /**
     * Get identification data of published dashboards
     * @returns tags and authors names of published dashboards
     */
    getBrowseData: () => Promise<BrowseObject>; // api/browse/init
    searchDashboard: (dashboards) => Promise<{ [id: number]: DashboardModel }>; // api/browse
}