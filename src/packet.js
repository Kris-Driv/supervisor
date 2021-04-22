const logger = require("./logger");

const decode = (pk) => pk.body;

const Packet = {

    EntityPosition: {
        name: "entity.position",
        broadcast: true,

        decode,
        encode: (eid, position) => {
            return Packet._encode('entity.position', {
                eid,
                position
            });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    PlayerJoin: {
        name: "player.join",
        broadcast: true,

        decode,
        encode: (eid, name, position) => {
            return Packet._encode('player.join', {
                eid,
                name,
                position
            });
        },
        handle: (pk, ws) => {
            logger.info(`${pk.body.name} joined the game`);
            return true;
        }
    },

    PlayerLeave: {
        name: "player.leave",
        broadcast: true,

        decode,
        encode: (eid, name) => {
            return Packet._encode('player.leave', {
                eid,
                name,
            });
        },
        handle: (pk, ws) => {
            logger.info(`${pk.body.name} left the game`);
            return true;
        }
    },

    Level: {
        name: "level",
        decode,

        encode: (name, chunks) => {
            return Packet._encode('level', {
                name,
                chunks: Buffer.from(JSON.stringify(chunks)).toString('base64')
            });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    Chunk: {
        name: "chunk",
        broadcast: true,

        decode,

        encode: (body) => {
            return Packet._encode('chunk', body);
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    Ping: {
        name: "ping",
        bounce: true,

        decode: (pk) => {
            return pk.body.time;
        },
        encode: (time) => {
            return Packet._encode('ping', { time });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    Subscribe: {
        name: "subscribe",
        decode: (pk) => {
            return true;
        },
        encode: () => {
            return Packet._encode('subscribe')
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    Message: {
        name: "message",
        broadcast: true,

        decode: (pk) => {
            return pk.body.message;
        },
        encode: (message) => {
            return Packet._encode('message', { message });
        },
        handle: (pk, ws) => {
            logger.info('Message: ' + Packet.Message.decode(pk));
            return true;
        }
    },

    _encode: (type, body = {}, extra = {}) => {
        return JSON.stringify({ type, body, ...extra });
    },

    _decode: (data) => {
        return JSON.parse(data);
    }

}

module.exports = Packet;
