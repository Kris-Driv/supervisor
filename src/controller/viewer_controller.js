const ViewerClient = require("../network/entity/viewer_client");
const _NetworkEntityStorageLogic = require("../network/network_entity_storage");
const Packet = require("../network/packet");
const logger = require("../utils/logger");

const ViewerController = {

    supervisor: null,

    _boot(supervisor) {
        ViewerController.supervisor = supervisor;
    },

    setup: () => {
        Packet.ViewPort.listeners.push(ViewerController.handleViewPortPacket);
    },

    handleViewPortPacket: (pk, ws) => {
        let ne = _NetworkEntityStorageLogic.getNetworkEntity(ws);

        if(ne instanceof ViewerClient) {
            ne.setViewPort(pk.body.worldX, pk.body.worldZ, pk.body.radius);
        } else {
            logger.warning('Received ViewPort packet from non viewer client');
        }
    },

};

module.exports = ViewerController;