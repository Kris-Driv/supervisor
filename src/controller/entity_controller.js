const _NetworkEntityStorageLogic = require("../network/network_entity_storage");
const Packet = require("../network/packet");

const EntityController = {

    supervisor: null,

    _boot(supervisor) {
        EntityController.supervisor = supervisor;
    },

    setup: () => {
        Packet.EntityPosition.listeners.push(EntityController.handlePositionPacket);
    },

    handlePositionPacket(pk, ws) {
        EntityController.supervisor.Handler._broadcast(pk, _NetworkEntityStorageLogic.viewers);
    },

};

module.exports = EntityController;