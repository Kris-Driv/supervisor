const NetworkEntity = require('./network_entity.js');

class ViewerClient extends NetworkEntity {

    handleLoginPacket(packet) {
        this.name = packet.body.name ?? 'unknown';
        this.level = packet.body.level ?? null;

        return true;
    }

}

module.exports = ViewerClient;