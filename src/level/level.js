const logger = require("../utils/logger.js");
const Packet = require("../network/packet");
const coord_hash = require("../utils/coord_hash.js");
const _NetworkEntityStorageLogic = require("../network/network_entity_storage.js");
const Handler = require("../network/handler.js");

class Level {

    static create(name) {
        return new Level(name);
    }

    constructor(name = 'world') {
        logger.info(`Level cache for '${name}' initiated`);

        this.name = name;
        this.chunks = [];
        this.entities = [];

        // md5 hashes to keep track of updated sectors
        this.hashes = [];

        this.cachedPacket = null;

        Packet.PlayerJoin.listeners.push((pk, ws) => {
            this.addEntity(pk.body.eid, {
                type: 'player',
                eid: pk.body.eid,
                position: pk.body.position,
                // entityData: pk.body
            });
        });

        Packet.PlayerLeave.listeners.push((pk, ws) => {
            this.removeEntity(pk.body.eid);
        });

        Packet.PlayerFace.listeners.push((pk, ws) => {
            let eid = pk.body.eid ?? 'missing';
            let player = this.entities[eid];
            if(!player) {
                logger.error('Recieved face packet for non existent entity. eid: ' + eid);
                return;
            }

            player.face = pk.body.pixelArray;
        });

        Packet.EntityPosition.listeners.push((pk, ws) => {
            this.updateEntityPosition(pk.body.eid, pk.body.position);
        });
    }

    get path() {
        return 'cache/' + this.name + '/' + this.name + '.json';
    }

    addEntity(eid, entity) {
        this.entities[eid] = entity;
    }

    removeEntity(eid) {
        if(!this.entities[eid]) return;

        this.entities.splice(eid, 1);
    }

    getEntities() {
        return this.entities;
    }

    updateEntityPosition(eid, position) {
        if(!this.entities[eid]) return;
        
        this.entities[eid].position = position;
    } 

    clearChunks(sectorCoordinates) {
        if(sectorCoordinates) {
            this.chunks[coord_hash(sectorCoordinates)] = [];
        } else {
            this.chunks = [];
        }
    }

    setChunk(x, z, chunk) {
        let sectorHash = coord_hash([x << 4, z << 4]);
        if(this.chunks[sectorHash] === undefined) {
            this.chunks[sectorHash] = [];
        }

        this.chunks[sectorHash][coord_hash([x, z])] = chunk;

        Handler._broadcast(Packet.Chunk.encode(x, z, chunk.layer), Object.values(_NetworkEntityStorageLogic.viewers).filter(viewer => {
            return !viewer.canSee(x << 4, z << 4);
        }));
    }

    setChunks(chunks) {
        Object.values(chunks).forEach(chunk => {
            this.setChunk(chunk.x, chunk.z, chunk);
        });
    }

    getSectorHash(sectorCoordinates) {
        return this.hashes[coord_hash(sectorCoordinates)] ?? null;
    }

    sendSector(viewer, sectorX, sectorZ) {
        viewer.send();

        return 'nothing special';
    }

}

// Export the class
module.exports = Level;