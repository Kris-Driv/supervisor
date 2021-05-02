const NetworkEntity = require('./network_entity.js');

class MinecraftServer extends NetworkEntity {

    handleLoginPacket(packet) {
        this.ip = packet.body.ip;
        this.port = packet.body.port;
        this.name = packet.body.name;
        this.levels = packet.body.levels;

        return true;
    }

}

module.exports = MinecraftServer;