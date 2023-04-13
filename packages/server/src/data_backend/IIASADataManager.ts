import fetch from 'node-fetch';

export default class IIASADataManager {

    private readonly url: string;

    constructor(url) {
        this.url = url;
    }

    getUrlBase = (path) => {
        return this.url + path;
    }

    getPromise = async (url, token) => {
        const fullUrl = this.getUrlBase(url);
        const options = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
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
                'Authorization': 'Bearer ' + "",
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        const response = await fetch(fullUrl, options);

        return response;
    }

    patchPromise = async (url, body?: any) => {
        const fullUrl = this.getUrlBase(url);
        const options = {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + "",
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        const response = await fetch(fullUrl, options);

        return response;
    }


}