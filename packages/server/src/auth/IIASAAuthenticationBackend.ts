import expressBasicAuth from "express-basic-auth";
import { IAuthenticationBackend } from "../interfaces/IAuthenticationBackend ";
import fetch from 'node-fetch';

// TODO handle errors
// TODO add refresh token into try/catch
// TODO See Decorator design pattern
// getData -> refresh -> and getData (2 fois)
export default class IIASAAuthenticationBackend implements IAuthenticationBackend {

    public config;

    constructor(config) {
        this.config = config;
    }

    getConfig = () => this.config;

    initializeToken = async (username, password, cb) => {
        const userMatches = expressBasicAuth.safeCompare(username, this.config.username);
        const passwordMatches = expressBasicAuth.safeCompare(password, this.config.password);
        try {
            if (!userMatches || !passwordMatches) {
                throw new Error("username or password incorrect!");
            } else {
                if (process.env["access_token"] != null && process.env["refresh_token"] != null) {
                    return cb(null, true);
                }
            }

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

            const response = await fetch(this.config.auth_url, options);
            const data = await response.json();

            const err: any = new Error();

            switch (response.status) {
                case 200:
                    process.env["access_token"] = data.access + "hehe";
                    process.env["refresh_token"] = data.refresh;
                    return cb(null, true); // null indicated no error
                case 401:
                    err.message = response.statusText + ": " + data.detail
                    err.status = 401;
                    throw err;
                default:
                    err.message = response.statusText + ": connexion error!";
                    err.status = 401;
                    throw err;
            }
        } catch (err: any) {
            console.error(err);
            return cb(null, false)
        }
    };

    unauthorizedResponse = (req) => {
        if (req.auth != null) {
            const userMatches = expressBasicAuth.safeCompare(req.auth.user, this.config.username);
            const passwordMatches = expressBasicAuth.safeCompare(req.auth.password, this.config.password);
            if (!userMatches || !passwordMatches) {
                return "username or password incorrect!";
            }
        }

        return 'No credentials provided'
    }

    refreshToken = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh: process.env["refresh_token"]
            })
        };

        const response = await fetch(this.config.refresh_token_url, options);
        const data = await response.json();

        if (response.status == 200) {
            process.env["access_token"] = data.access;
            return true;
        } else {
            const err: any = new Error(data.code + ": " + data.detail);
            err.status = 401;
            err.code = data.code;
            throw err;
        }

        // If error thrown here -> ask user to re-authenticate

        // Error if token is invalide or expired
        // {
        //     "detail": "Token is invalid or expired",
        //     "code": "token_not_valid"
        // }
    };

}