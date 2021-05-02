const _LevelCacheStorageLogic = require("../level/level_storage.js");
const Handler = require("../network/handler.js");
const _NetworkEntityStorageLogic = require("../network/network_entity_storage.js");
const Packet = require("../network/packet.js");

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

            // Broadcast chunks to viewers that can actually see this chunk on their screen
            Handler._broadcast(pk, Object.values(_NetworkEntityStorageLogic.viewers).filter(viewer => {
                return viewer.canSee(pk.body.chunk.x << 4, pk.body.chunk.z << 4);
            }));
            
        } else {
            // TODO
            throw 'No cache to store incoming chunk';
        }
    },

};

module.exports = ChunkController;