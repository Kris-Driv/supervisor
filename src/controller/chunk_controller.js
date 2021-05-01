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
        ChunkController.supervisor.Handler._broadcast(pk, _NetworkEntityStorageLogic.viewers);
    },

};

module.exports = ChunkController;