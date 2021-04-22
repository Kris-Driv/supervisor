const logger = require('./logger.js');

const WebSocket = require('ws');
const Level = require('./level.js');
const Packet = require('./packet.js');

const express = require("express");
const app = express();

app.use(express.static("web"));
app.get("/", (req, res) => { 
    res.sendFile(__dirname + "/web/index.html") 
});
app.listen(8080);

const wss = new WebSocket.Server({ port: 27095 });

const subscribers = [];

const levelCache = new Level('pm_level1');

Packet.Subscribe.listeners = [handleSubscriptions];
Packet.Chunk.listeners = [handleChunkPacket];
Packet.Level.listeners = [handleLevelPacket];

wss.on('connection', (ws) => {
    // console.log('Client connected');


    ws.on('message', (data) => {
        if (!Handler._process(data, ws)) {
            logger.error('handling error detected');
        }
    });

    ws.on('close', () => {
        // console.log('Client disconnected');


        let index = subscribers.indexOf(ws);
        if (index !== -1) {
            subscribers.splice(index, 1);
        }
    })
});


function handleLevelPacket(pk, ws) {
    ws.send(levelCache.toPacket());
}

function handleChunkPacket(pk, ws) {
    let chunk = pk.body.chunk;
    // console.log(`Chunk (${chunk.x}, ${chunk.z}) recieved`);
    levelCache.setChunk(chunk.x, chunk.z, chunk);
}

function handleSubscriptions(pk, ws) {
    if (subscribers.indexOf(ws) === -1) {
        subscribers.push(ws);
        logger.info('Client subscribed to broadcasts');

        return true;
    }
    logger.notice('Client tried subscribing twice, thats not allowed!');

    return false;
}

const Handler = {

    registered: {
        'entity.position': Packet.EntityPosition,
        'player.join': Packet.PlayerJoin,
        'player.leave': Packet.PlayerLeave,

        'level': Packet.Level,
        'chunk': Packet.Chunk,
        'ping': Packet.Ping,
        'subscribe': Packet.Subscribe,
        'message': Packet.Message,
    },

    _process: (data, ws) => {
        let pk, $type;

        try {
            pk = Packet._decode(data);
        } catch (e) {
            logger.error('Error decoding packet: ' + e);
        }

        if (!pk) return false;
        if (!Handler._validate(pk, ws)) return false;

        $type = Handler.registered[pk.type] ?? null;

        if (!$type) {
            logger.error(`Packet '${pk.type}' type not registered`);
            return false;
        }

        let status = $type.handle(pk, ws);

        if ($type.listeners) {
            $type.listeners.forEach(cb => {
                cb(pk, ws);
            })
        }

        if (!status) return false;

        // Do common actions
        if (pk.type === 'level') return true; // Patch

        let encoded = Packet._encode(pk.type, pk.body);

        if ($type.bounce) {
            ws.send(encoded);
        }
        if ($type.broadcast) {
            Handler._broadcast(encoded);
        }

        return status;
    },

    _validate: (packet, ws) => {
        if (packet.type === undefined) {
            logger.error('Recieved packet with unknown type. Packet ignored!');

            return false;
        }

        return true;
    },

    _broadcast: (packet) => {
        subscribers.forEach(socket => {
            socket.send(packet);
        })
    }

}
