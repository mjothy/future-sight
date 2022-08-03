import express from 'express';
import cors from 'cors';
import { join } from 'path';
// Static database for testing
import models from './data/models.json';
import variables from './data/variables.json';
import regions from './data/regions.json';
import data from './data/data.json';
import bodyParser from 'body-parser';

const clientPath = '../../client/build';
const app = express();
app.use(bodyParser.json())

app.use(cors());
const port = 8080; // default port to listen

// Serve static resources from the "public" folder (ex: when there are images to display)
app.use(express.static(join(__dirname, clientPath)));

app.get('/api', (req, res) => {
    res.send(`Hello , From server`);
});

app.get('/api/data', (req, res) => {
    res.send(data);
});

app.get('/api/models', (req, res) => {
    res.send(models);
});

app.get(`/api/variables`, (req, res) => {
    const model = req.query.model;
    const scenario = req.query.scenario;

    variables.forEach(variable => {
        if (variable.model === model && variable.scenario === scenario)
            res.send({...variable});
    });

    res.status(404).send("No data found");
});

app.get(`/api/regions`, (req, res) => {
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
app.get('*', (req: any, res: any) => {
    res.sendFile(join(__dirname, clientPath, 'index.html'));
});

// start the Express server
app.listen(port, () => {
    console.log(`app started at http://localhost:${port}`);
});