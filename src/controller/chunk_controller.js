const _LevelCacheStorageLogic = require("../level/level_storage");
const _NetworkEntityStorageLogic = require("../network/network_entity_storage");
const Packet = require("../network/packet");

const ChunkController = {

    supervisor: null,

    _boot(supervisor) {
        ChunkController.supervisor = supervisor;
    },

    setup: () => {
        Packet.Chunk.listeners.push(ChunkController.handleChunkPacket);
    },

    handleChunkPacket(pk, ws) {
        let cache = _LevelCacheStorageLogic.getCacheByName('test');

        if(cache) {
            cache.setChunk(pk.body.chunk.x, pk.body.chunk.z, pk.body.chunk);
        } else {
            // TODO
            throw 'No cache to store incoming chunk';
        }
    },

};

module.exports = ChunkController;