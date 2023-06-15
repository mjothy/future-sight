import fetch from 'node-fetch';
import { IAuthenticationBackend } from '../interfaces/IAuthenticationBackend ';
export default class IIASADataManager {

    private readonly authentication: IAuthenticationBackend;

    constructor(authentication: IAuthenticationBackend) {
        this.authentication = authentication;
    }
    getUrlBase = (path) => {
        return this.authentication.getConfig().ecemf_url + path;
    }

    /**
     * Patch request
     * @param url filter path
     * @param body The body of url options 
     * @param refresh Enable refreshing token for the first time if token is invalide or expired (set to true)
     * @returns Promise
     */
    patchPromise = async (url, body?: any, refresh = true) => {
        const fullUrl = this.getUrlBase(url);
        const options = {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + process.env["access_token"],
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };
        try {
            const response = await fetch(fullUrl, options);
            const resp_obj = await response.json();

            const err: any = new Error();

            switch (response.status) {
                case 200:
                    return resp_obj;
                case 401:
                    err.message = resp_obj.error_name + ": " + resp_obj.message;
                    err.status = 401;
                    err.error_name = resp_obj.error_name;
                    throw err;
                case 404: // Not Found
                    err.message = resp_obj.detail;
                    err.status = 404;
                    throw err;
                default:
                    err.message = "Server error!";
                    err.status = response.status;
                    throw err;
            }
        } catch (err: any) {
            // invalid_token for access token not valid
            /**
             * 
                {
                    "message": "The supplied token is expired or invalid.",
                    "kwargs": {},
                    "error_name": "invalid_token"
                }
             */
            if (err.status == 401 && err.error_name == "invalid_token" && refresh) {
                const refreshToken = await this.authentication.refreshToken();
                if (refreshToken) {
                    return await this.patchPromise(url, body, false);
                }
            } else {
                throw err;
            }
        }
    }


}