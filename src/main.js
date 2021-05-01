const fs = require("fs");
const WebSocket = require('ws');

const logger = require('./utils/logger.js');
const Supervisor = require('./supervisor.js');
const Packet = require('./network/packet.js');
const Input = require('./command/input.js');

/*
 * Setup the Http server to serve web view and associated assets
 */
const express = require("express");

const app = express();

app.use(express.static("web"));
app.use('/skins', express.static("skins"));
app.use('/assets', express.static('web/assets'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/web/index.html")
});

app.listen(8080);

/*
 * Create the websocket server and listen for connections
 */
const wss = new WebSocket.Server({ port: 27095 });

/*
 * Configure data folders
 */
if (!fs.existsSync("cache")) {
    fs.mkdirSync("cache");
}
if (!fs.existsSync("skins")) {
    fs.mkdirSync("skins");
}

// Placeholder
const config = {};

Supervisor._setup(wss, config);

// function handleLevelPacket(pk, ws) {
//     ws.send(levelCache.toPacket());
// }

// function handleChunkPacket(pk, ws) {
//     let chunk = pk.body.chunk;
//     // console.log(`Chunk (${chunk.x}, ${chunk.z}) recieved`);
//     levelCache.setChunk(chunk.x, chunk.z, chunk);
// }

// function handleSubscriptions(pk, ws) {
//     if (viewers.indexOf(ws) === -1) {
//         viewers.push(ws);
//         logger.info('Client subscribed to broadcasts');

//         return true;
//     }
//     logger.notice('Client tried subscribing twice, thats not allowed!');

//     return false;
// }