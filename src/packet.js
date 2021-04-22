const Packet = {

    Chunk: {
        broadcast: true,

        decode: (pk) => {
            return pk.body;
        },
        encode: (body) => {
            return Packet._encode('chunk', body);
        },
        handle: (pk, ws) => {
            return true;
        }
    },

    Ping: {
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
        broadcast: true,

        decode: (pk) => {
            return pk.body.message;
        },
        encode: (message) => {
            return Packet._encode('message', { message });
        },
        handle: (pk, ws) => {
            console.log('Message: ' + Packet.Message.decode(pk));
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