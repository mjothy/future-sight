
export default class IIASADataManager {

    private readonly url: string;
    private readonly specialKey: string;
    private readonly accessToken: string;

    constructor(url, specialKey, accessToken) {
        this.url = url;
        this.specialKey = specialKey;
        this.accessToken = accessToken;
    }

    getUrlBase = (url) => {
        return this.url + this.specialKey + url;
    }

    getPromise = async (url) => {
        const fullUrl = this.getUrlBase(url);
        const options = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(fullUrl, options);

        return response;
    }

    patchPromise = async (url, body?: any) => {
        const fullUrl = this.getUrlBase(url);
        const options = {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        const response = await fetch(fullUrl, options);

        return response;
    }


}