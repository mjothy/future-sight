import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import {join} from "path";
import cookieParser from 'cookie-parser'

import data from "../data/data.json";
import models from "../data/models.json";
import variables from "../data/variables.json";
import regions from "../data/regions.json";

export default class ExpressServer {
    private app: any;
    private readonly port: number;
    private readonly auth: any;
    private readonly clientPath: any;

    constructor(port, cookieKey, auth, clientPath) {
        this.app = express();
        this.port = port;
        this.auth = auth;
        this.clientPath = clientPath
        this.app.use(bodyParser.json());
        if (auth) {
            this.app.use(this.auth);
        }
        this.app.use(cookieParser(cookieKey));
        this.app.use(cors());
        // Serve static resources from the "public" folder (ex: when there are images to display)
        this.app.use(express.static(join(__dirname, clientPath)));
        this.endpoints()
    }

    private endpoints = () => {
        this.app.get('/api/users/auth', (req, res) => {
            const options = {
                httpOnly: true,
                signed: true,
            };

            if (req.auth.user === 'admin') {
                res.cookie('name', 'admin', options).send({ screen: 'admin' });
            } else if (req.auth.user === 'user') {
                res.cookie('name', 'user', options).send({ screen: 'user' });
            }
            res.send({auth: 'ok'});
        });

        this.app.get('/api', (req, res) => {
            res.send(`Hello , From server`);
        });

        this.app.get('/api/data', (req, res) => {
            res.send(data);
        });

        this.app.get('/api/models', (req, res) => {
            res.send(models);
        });

        this.app.get(`/api/variables`, (req, res) => {
            const model = req.query.model;
            const scenario = req.query.scenario;

            variables.forEach(variable => {
                if (variable.model === model && variable.scenario === scenario)
                    res.send({...variable});
            });

            res.status(404).send("No data found");
        });

        this.app.get(`/api/regions`, (req, res) => {
            const model = req.query.model;
            const scenario = req.query.scenario;

            let allRegions :any[]= [];
            regions.forEach(region => {
                if (region.model === model && region.scenario === scenario)
                    allRegions = [...allRegions, ...region.regions];
            });
            res.send(allRegions);
        });

        // Serve the HTML page
        this.app.get('*', (req: any, res: any) => {
            res.sendFile(join(__dirname, this.clientPath, 'index.html'));
        });
    }

    startup = () => {
        // start the Express server
        this.app.listen(this.port, () => {
            console.log(`app started at http://localhost:${this.port}`);
        });
    }
}
