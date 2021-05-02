const logger = require("../utils/logger");

const decode = (pk) => pk.body;

const Packet = {

    ViewerLogin: {
        listeners: [],
        name: "login.viewer",
        broadcast: true,

        decode,
        encode: () => {
            return Packet._encode(Packet.ViewerLogin.name, { status: true });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    ServerLogin: {
        listeners: [],
        name: "login.server",
        broadcast: true,

        decode,
        encode: () => {
            return Packet._encode(Packet.ServerLogin.name, { status: true });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    InfoPacket: {
        listeners: [],
        name: "info",
        broadcast: true,

        decode,
        encode: (serverName, ip, port, levels, viewerCount) => {
            return Packet._encode(Packet.InfoPacket.name, {
                serverName, ip, port, levels, viewerCount
            });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    ViewPort: {
        listeners: [],
        name: "viewport",
        broadcast: true,

        decode,
        encode: (worldX, worldZ, radius) => {
            return Packet._encode(Packet.ViewPort.name, {
                worldX, worldZ, radius
            });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    Close: {
        listeners: [],
        name: "close",
        broadcast: false,

        decode,
        encode: (reason) => {
            return Packet._encode(Packet.Close.name, { reason });
        },
        handle: (pk, ws) => {
            return false;
        }
    },

    EntityPosition: {
        listeners: [],
        name: "entity.position",
        broadcast: true,

        decode,
        encode: (eid, position) => {
            return Packet._encode(Packet.EntityPosition.name, {
                eid,
                position
            });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    PlayerMessage: {
        listeners: [],
        name: "player.message",
        broadcast: true,

        decode,
        encode: (eid, message) => {
            return Packet._encode(Packet.PlayerMessage.name, { eid, message });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    PlayerJoin: {
        listeners: [],
        name: "player.join",
        broadcast: true,

        decode,
        encode: (eid, name, position, face = null) => {
            return Packet._encode(Packet.PlayerJoin.name, {
                eid,
                name,
                position,
                face
            });
        },
        handle: (pk, ws) => {
            logger.info(`${pk.body.name} joined the game`);
            return true;
        }
    },

    PlayerLeave: {
        listeners: [],
        name: "player.leave",
        broadcast: true,

        decode,
        encode: (eid, name) => {
            return Packet._encode(Packet.PlayerLeave.name, {
                eid,
                name,
            });
        },
        handle: (pk, ws) => {
            logger.info(`${pk.body.name} left the game`);
            return true;
        }
    },

    PlayerFace: {
        listeners: [],
        name: "player.face",
        broadcast: true,

        decode,
        encode: (eid, pixelArray) => {
            return Packet._encode(Packet.PlayerFace.name, {
                eid,
                pixelArray,
                size: 64
            });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    Sector: {
        listeners: [],
        name: "sector",
        decode,

        encode: (chunks, entities) => {
            return Packet._encode(Packet.Sector.name, {
                chunks: Buffer.from(JSON.stringify(Object.values(chunks))).toString('base64'),
                entities
            });
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    Chunk: {
        listeners: [],
        name: "chunk",
        broadcast: true,

        decode,

        encode: (x, z, layer) => {
            return Packet._encode(Packet.Chunk.name, {x, z, layer});
        },
        
        handle: (pk, ws) => {
            return true;
        }
    },

    Ping: {
        listeners: [],
        name: "ping",
        bounce: true,

        decode: (pk) => {
            return pk.body.time;
        },
        encode: (time) => {
            return Packet._encode(Packet.Ping.name, { time });
        },
        handle: (pk, ws) => {
            ws.send(JSON.stringify(pk));
            return true;
        }
    },

    Message: {
        listeners: [],
        name: "message",
        broadcast: true,

        decode: (pk) => {
            return pk.body.message;
        },
        encode: (message) => {
            return Packet._encode(Packet.Message.name, { message });
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
