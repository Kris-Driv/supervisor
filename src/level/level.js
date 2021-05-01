const logger = require("../utils/logger.js");
const Packet = require("../network/packet");

class Level {

    static create(name) {
        return new Level(name);
    }

    constructor(name = 'world') {
        logger.info(`Level cache for '${name}' initiated`);

        this.name = name;
        this.chunks = [];
        this.entities = [];

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

    clearChunks() {
        this.chunks = [];
    }

    setChunk(x, z, chunk) {
        this.chunks[x + ':' + z] = chunk;

        this.cachedPacket = null;
    }

    setChunks(chunks) {
        Object.values(chunks).forEach(chunk => {
            this.setChunk(chunk.x, chunk.z, chunk);
        });
    }

    toJSON() {
        if(this.cachedPacket) {
            return this.cachedPacket;
        }

        this.cachedPacket = Packet.Level.encode(this.name, this.chunks, this.entities);
        return this.cachedPacket;
    }

}

// Export the class
module.exports = Level;