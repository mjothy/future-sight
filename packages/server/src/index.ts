import express from 'express';
import cors from 'cors';
import { join } from 'path';
import scenarios from './data/scenarios.json';

const clientPath = '../../client/build';
const app = express();
app.use(cors());
const port = 8080; // default port to listen

// Serve static resources from the "public" folder (ex: when there are images to display)
app.use(express.static(join(__dirname, clientPath)));

app.get('/api', (req, res) => {
    res.send(`Hello , From server`);
});

app.get('/api/scenarios', (req, res) => {
    res.send(scenarios);
});

// Serve the HTML page
app.get('*', (req: any, res: any) => {
    res.sendFile(join(__dirname, clientPath, 'index.html'));
});

// start the Express server
app.listen(port, () => {
    console.log(`app started at http://localhost:${port}` );
});
