const _NetworkEntityStorageLogic = require("../network/network_entity_storage");
const Packet = require("../network/packet");

const PlayerController = {

    supervisor: null,

    _boot(supervisor) {
        PlayerController.supervisor = supervisor;
    },

    setup: () => {
        Packet.PlayerJoin.listeners.push(PlayerController.handlePlayerJoin);
        Packet.PlayerLeave.listeners.push(PlayerController.handlePlayerLeave);
        Packet.PlayerMessage.listeners.push(PlayerController.handlePlayerMessage);
        Packet.PlayerMessage.listeners.push(PlayerController.handlePlayerMessage);
    },

    handlePlayerJoin(pk, ws) {
        PlayerController.supervisor.Handler._broadcast(pk, _NetworkEntityStorageLogic.viewers);
    },

    handlePlayerLeave(pk, ws) {
        PlayerController.supervisor.Handler._broadcast(pk, _NetworkEntityStorageLogic.viewers);
    },

    handlePlayerMessage(pk, ws) {
        PlayerController.supervisor.Handler._broadcast(pk, _NetworkEntityStorageLogic.viewers);
    },

    handlePlayerFacePacket(pk, ws) {
        PlayerController.supervisor.Handler._broadcast(pk, _NetworkEntityStorageLogic.viewers);

    }

};

module.exports = PlayerController;