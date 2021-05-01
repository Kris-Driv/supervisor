const logger = require("../utils/logger");
const Packet = require("./packet");

const reg = {};

Object.keys(Packet).filter(i=> !i.startsWith("_")).forEach(i=> {
    reg[Packet[i].name] = Packet[i];
})

const Handler = {

    // List of registered packets
    registered: reg,

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
            logger.error('Received packet with unknown type. Packet ignored!');

            return false;
        }

        return true;
    },

    _broadcast: (packet, recipients = []) => {
        if(typeof packet !== 'string') {
            packet = JSON.stringify(packet);
        }

        recipients.forEach(networkEntity => {
            networkEntity.send(packet);
        });
    }

}

module.exports = Handler;