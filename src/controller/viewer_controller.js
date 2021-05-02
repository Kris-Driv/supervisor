const _LevelCacheStorageLogic = require("../level/level_storage");
const ViewerClient = require("../network/entity/viewer_client");
const _NetworkEntityStorageLogic = require("../network/network_entity_storage");
const Packet = require("../network/packet");
const logger = require("../utils/logger");
const coord_hash = require('../utils/coord_hash.js');

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

        if (ne instanceof ViewerClient) {
            ne.setViewPort(pk.body.worldX, pk.body.worldZ, pk.body.radius);

            let level = _LevelCacheStorageLogic.getCacheByName(ne.level);

            if(!level) {
                throw 'viewer is subscribed to invalid level: ' + ne.level;
            }

            let visibleSectors = ne.visibleSectors();
            let result = visibleSectors.next();

            while (!result.done) {
                let sectorCoordinates = result.value;

                let hash = level.getSectorHash(sectorCoordinates);
                let curr = ne.sectorsReceived[coord_hash(sectorCoordinates)];

                if (curr === undefined || hash !== curr) {
                    let hash = level.sendSector(ne, sectorCoordinates[0], sectorCoordinates[1]);

                    if(hash) {
                        ne.sectorsReceived[coord_hash(sectorCoordinates)] = hash;
                    }
                }

                result = visibleSectors.next();
            }
        } else {
            logger.warning('Received ViewPort packet from non viewer client');
        }
    },

};

module.exports = ViewerController;