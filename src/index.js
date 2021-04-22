const WebSocket = require('ws');
const Level = require('./level.js');
const Packet = require('./packet.js');

const wss = new WebSocket.Server({ port: 27095 });

const subscribers = [];
Packet.Subscribe.listeners = [handleSubscriptions];

wss.on('connection', (ws) => {
    console.log('Client connected');


    ws.on('message', (data) => {
        if(!Handler._process(data, ws)) {
            console.log('handling error detected');
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');


        let index = subscribers.indexOf(ws);
        if(index !== -1) {
            subscribers.splice(index, 1);
        }
    })
});

function handleSubscriptions(pk, ws) {
    if(subscribers.indexOf(ws) === -1) {
        subscribers.push(ws);
        console.log('Client subscribed to broadcasts');

        return true;
    }
    console.log('Client tried subscribing twice, thats not allowed!');

    return false;
}

const Handler = {

    registered: {
        'ping': Packet.Ping,
        'subscribe': Packet.Subscribe,
        'message': Packet.Message,
    },

    _process: (data, ws) => {
        let pk, $type;

        try {
            pk = Packet._decode(data);
        } catch (e) {
            console.error('Error decoding packet: ' + e);
        }

        if(!pk) return false;
        if(!Handler._validate(pk, ws)) return false;

        $type = Handler.registered[pk.type] ?? null;

        if(!$type) {
            console.error(`Packet '${pk.type}' type not registered`);
            return false;
        }

        let status = $type.handle(pk, ws);

        if($type.listeners) {
            $type.listeners.forEach(cb => {
                cb(pk, ws);
            })
        }

        if(!status) return false;

        // Do common actions
        let encoded = $type.encode($type.decode(pk));

        if($type.bounce) {
            ws.send(encoded);
        }
        if($type.broadcast) {
            Handler._broadcast(encoded);
        }

        return status;
    },

    _validate: (packet, ws) => {
        if (packet.type === undefined) {
            console.error('Recieved packet with unknown type. Packet ignored!');

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