import { DashboardModel } from "@future-sight/common";
import RedisClient from "./RedisClient";
import IPersistenceManager from "./IPersistenceManager";

export default class RedisPersistenceManager extends RedisClient implements IPersistenceManager {

    constructor(url) {
        super(url)
    }

    saveDashboard = async (dashboard: DashboardModel) => {
        const id = await this.getClient().incr('dashboards:id');
        // Save the dashboard
        dashboard.id = id; // change id
        await this
            .getClient()
            .json.set('dashboards', `.${id}`, dashboard);

        // Update the indexes
        for (const tag of dashboard.userData.tags) {
            await this.appendDashboardIdToIndexList(id, 'tags', tag) // Set the tags indexes
        }
        // Set the au thors indexes
        await this.appendDashboardIdToIndexList(id, 'authors', dashboard.userData.author);
        return JSON.stringify({ id: id });
    };

    getDashboardById = async (id: any) => {
        const dashboard: DashboardModel | null = await this
            .getClient()
            .json.get('dashboards', { path: [`.${id}`] });
        return dashboard;
    };

    getAllDashboards = async () => {
        const latestId = await this.getClient().get('dashboards:id');
        const idsToFetch = [latestId];
        // Get the 5 last published dashboards
        for (let i = 1; i < 5; i++) {
            idsToFetch.push(latestId - i);
        }
        const dashboards: any[] = [];
        for (let i = latestId; i > latestId - 5; i--) {
            try {
                const dashboard = await this
                    .getClient()
                    .json.get('dashboards', { path: i.toString() });
                dashboards.push(dashboard)
            } catch (e) {
                // no dashboard found for id
            }
        }

        return dashboards;
    };

    getBrowseData = async () => {
        const data = await this
            .getClient()
            .json.mGet(['authors', 'tags'], '.');
        // data is returned as: [ { author1: [], author2: [], ... }, { tag1: [], tag2: [], ... } ]
        const authors = data[0];
        const tags = data[1];
        const authorsTransform = {};
        const tagsTransform = {};
        Object.keys(authors).forEach(key => authorsTransform[key.replace(/%/g, ' ')] = authors[key])
        Object.keys(tags).forEach(key => tagsTransform[key.replace(/%/g, ' ')] = tags[key])
        console.log({ authors: authorsTransform, tags: tagsTransform })
        return { authors: authorsTransform, tags: tagsTransform };
    };

    searchDashboard = async (dashboards: any) => {
        const data = await this
            .getClient()
            .json.get('dashboards', { path: dashboards.map(String) });
        let results = {}
        if (dashboards.length === 1) {
            results[dashboards[0]] = data;
        } else {
            results = Object.entries(data).reduce(
                (obj, [key, dashboard]) => Object.assign(obj, { [key]: dashboard }),
                {}
            );
        }

        return results;
    };

    appendDashboardIdToIndexList = async (id: string, indexListKey: string, value: string) => {
        // Initialize the key if it does not exist
        const valueTransform = value.replace(/ /g, '%');
        await this.getClient().json.set(indexListKey, `.${valueTransform}`, [], {
            NX: true, // only set the key if it does not already exist
        });
        // Append the dashboard id to the list
        await this
            .getClient()
            .json.arrAppend(indexListKey, `.${valueTransform}`, id);
    };

}