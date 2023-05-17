import fetch from 'node-fetch';
import config from '../configurations/config.json'
import { IAuthenticationBackend } from '../interfaces/IAuthenticationBackend ';
export default class IIASADataManager {

    private readonly url: string = config.ecemf_url;
    private readonly authentication: IAuthenticationBackend;

    constructor(authentication: IAuthenticationBackend) {
        this.authentication = authentication;
    }
    getUrlBase = (path) => {
        return this.url + path;
    }

    getPromise = async (url) => {
        const fullUrl = this.getUrlBase(url);
        const options = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.authentication.getToken(),
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(fullUrl, options);

        return response;
    }

    postPromise = async (url, body?: any) => {
        const fullUrl = this.getUrlBase(url);
        const options = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.authentication.getToken(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        const response = await fetch(fullUrl, options);

        return response;
    }

    /**
     * Patch request
     * @param url filter path
     * @param body The body of url options 
     * @returns Promise
     */
    patchPromise = async (url, body?: any) => {
        const fullUrl = this.getUrlBase(url);
        const options = {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + this.authentication.getToken(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        const response = await fetch(fullUrl, options);

        return response;
    }


}