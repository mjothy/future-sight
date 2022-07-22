import express from 'express';
import cors from 'cors';
import { join } from 'path';
// Static database for testing
import models from './data/models.json';
import variables from './data/variables.json';
import regions from './data/regions.json';
import data from './data/data.json';

const clientPath = '../../client/build';
const app = express();
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

    variables.forEach(element => {
        if (element.Model === model && element.Scenario === scenario)
            res.send(element.variables);
    });

    res.status(404).send("No data found");
});

app.get(`/api/regions`, (req, res) => {
    const model = req.query.model;
    const scenario = req.query.scenario;
    const variable = req.query.variable;


    regions.forEach(element => {
        if (element.Model === model && element.Scenario === scenario &&
            element.Variable === variable)
            res.send(element.regions);
    });

    res.status(404).send("No data found");
});

// Serve the HTML page
app.get('*', (req: any, res: any) => {
    res.sendFile(join(__dirname, clientPath, 'index.html'));
});

// start the Express server
app.listen(port, () => {
    console.log(`app started at http://localhost:${port}`);
});