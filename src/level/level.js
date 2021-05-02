const logger = require("../utils/logger.js");
const Packet = require("../network/packet");
const coord_hash = require("../utils/coord_hash.js");
const _NetworkEntityStorageLogic = require("../network/network_entity_storage.js");
const Handler = require("../network/handler.js");
const md5 = require('blueimp-md5');

class Level {

    static create(name) {
        return new Level(name);
    }

    constructor(name = 'world') {
        logger.info(`Level cache for '${name}' initiated`);

        this.name = name;
        // coordHash => chunks[] (x, z, layer)
        this.chunks = [];
        // Should be divided into sectors as well, TODO
        this.entities = [];

        // coordHash => md5 hashes to keep track of updated sectors
        this.hashes = [];

        // md5 => packet string
        this.cachedPackets = [];

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
        return './cache/' + this.name + '/' + this.name + '.json';
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
        let sectorHash = coord_hash([x >> 4, z >> 4]);
        if(this.chunks[sectorHash] === undefined) {
            this.chunks[sectorHash] = [];
        }

        this.chunks[sectorHash][coord_hash([x, z])] = chunk;

        sectorHash = this.getSectorHash([x >> 4, z >> 4]);
        if(this.cachedPackets[sectorHash]) {
            // This eats into memory, todo: remove the key
            this.cachedPackets[sectorHash] = null;
        }
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
        let coordHash = coord_hash([sectorX, sectorZ]);
        let sector = this.chunks[coordHash];
        let packet;
        let sectorHash;

        // If sector exists and can be sent now
        if(sector) {
            // Check if there is previous versions that already was sent
            sectorHash = this.getSectorHash([sectorX, sectorZ]);
            if(sectorHash) {
                packet = this.cachedPackets[sectorHash];
            }

            if(!packet) {
                packet = Packet.Sector.encode(sector, []);
                sectorHash = md5(packet);
                this.cachedPackets[sectorHash] = packet;
            }

            this.hashes[coordHash] = sectorHash;    
            viewer.send(packet);
        }

        return sectorHash ?? null;
    }

    toJSON() {
        let chunks = Object.values(this.chunks).map((sector) => {
            return Object.values(sector);
        }).flat();

        return JSON.stringify({
            chunks: chunks,
            name: this.name,
        });
    }

    static fromJSON(jsonString) {
        let data = JSON.parse(jsonString);

        let instance = Level.create(data.name);

        data.chunks.map(chunk => {
            instance.setChunk(chunk.x, chunk.z, chunk);
        });
        
        return instance;
    }

}

// Export the class
module.exports = Level;