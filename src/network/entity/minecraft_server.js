const _LevelCacheStorageLogic = require('../../level/level_storage.js');
const NetworkEntity = require('./network_entity.js');

class MinecraftServer extends NetworkEntity {

    handleLoginPacket(packet) {
        this.ip = packet.body.ip;
        this.port = packet.body.port;
        this.name = packet.body.name;
        this.levels = packet.body.levels;

        this.prepareCaches(this.levels);

        return true;
    }

    prepareCaches(levels) {
        _LevelCacheStorageLogic.loadCaches(levels, true);
    }

}

module.exports = MinecraftServer;