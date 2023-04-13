import { IAuthenticationBackend } from "../interfaces/IAuthenticationBackend ";
import fetch from 'node-fetch';

const AUTH_URL = "https://api.dev.manager.ece.iiasa.ac.at/v1/token/obtain";
const REFRESH_URL = "https://api.dev.manager.ece.iiasa.ac.at/v1/token/refresh";

export default class IIASAAuthenticationBackend implements IAuthenticationBackend {

    private intervalId;
    private username;
    private password;
    private access_token;
    private refresh_token;

    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.initializeToken();
    }

    getToken = () => this.access_token;

    getRefreshToken = () => this.refresh_token;

    initializeToken = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.username,
                password: this.password
            })
        };
        try {
            const response = await fetch(AUTH_URL, options)
            const data = await response.json();
            this.access_token = data.access;
            this.refresh_token = data.refresh;
        } catch (err) { console.error("Fetch token failed: ", err) }
    };

    refreshToken = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh: this.refresh_token

            })
        };

        try {
            const response = await fetch(REFRESH_URL, options);
            const data = await response.json();
            this.access_token = data.access;
        } catch (err) { console.error("Fetch token with refresh failed: ", err) }
    };

    /**
     * Refresh token after each minute
     */
    startRefreshing() {
        this.intervalId = setInterval(() => {
            this.refreshToken();
        }, 60 * 1000);
    }

    stopRefreshing() {
        clearInterval(this.intervalId);
    }


}