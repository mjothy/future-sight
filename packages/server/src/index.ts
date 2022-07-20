import express from 'express';
import cors from 'cors';
import { join } from 'path';
import testData from './data/test-data.json';

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
    res.send(testData);
});

app.get('/api/models', (req, res) => {

    const models = new Array<string>();

    testData.forEach(data => {
        if (models.indexOf(data['Model']) < 0)
            models.push(data['Model']);
    });
    res.send(models);
});

app.get(`/api/scenarios`, (req, res) => {
    const scenarios = new Array<string>();
    console.log("params: ",req.query);
    testData.forEach(data => {
        if (scenarios.indexOf(data['Scenario']) < 0 && data['Model']===req.query.model)
            scenarios.push(data['Scenario']);
    });
    res.send(scenarios);
});

// Serve the HTML page
app.get('*', (req: any, res: any) => {
    res.sendFile(join(__dirname, clientPath, 'index.html'));
});

// start the Express server
app.listen(port, () => {
    console.log(`app started at http://localhost:${port}`);
});