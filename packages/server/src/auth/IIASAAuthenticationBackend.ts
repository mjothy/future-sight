import { IAuthenticationBackend } from "../interfaces/IAuthenticationBackend ";
import fetch from 'node-fetch';

// TODO handle errors
// TODO add refresh token into try/catch
// TODO See Decorator design pattern
export default class IIASAAuthenticationBackend implements IAuthenticationBackend {

    private intervalId;
    public config;
    private access_token;
    private refresh_token;

    constructor(config) {
        this.config = config;
        this.initializeToken();
    }
    getConfig = () => this.config;

    getToken = () => this.access_token;

    getRefreshToken = () => this.refresh_token;

    initializeToken = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.config.username,
                password: this.config.password
            })
        };
        try {
            const response = await fetch(this.config.auth_url, options)
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
            const response = await fetch(this.config.refresh_token_url, options);
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