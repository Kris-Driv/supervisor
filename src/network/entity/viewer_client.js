const coord_hash = require('../../utils/coord_hash.js');
const NetworkEntity = require('./network_entity.js');

class ViewerClient extends NetworkEntity {

    handleLoginPacket(packet) {
        this.name = packet.body.name ?? 'unknown';
        this.level = packet.body.level ?? 'test';

        this.worldX = 0;
        this.worldZ = 0;
        this.radius = 2;

        this.sectorsReceived = [];

        return true;
    }

    setLevel(cache) {
        this.level = cache;
    }

    canSee(worldX, worldZ) {
        return (Math.sqrt(Math.pow((this.worldX - worldX), 2) + Math.pow((this.worldZ - worldZ), 2)) <= (this.radius << 8));
    }

    *visibleSectors() {
        let sectorX = this.worldX >> 8;
        let sectorZ = this.worldZ >> 8;

        for(var x = -this.radius; x <= this.radius; x ++) {
            for(var z = -this.radius; z <= this.radius; z++) {
                yield [sectorX + x, sectorZ + z];
            }
        }
    }

    setViewPort(worldX, worldZ, radius) {
        this.worldX = worldX;
        this.worldZ = worldZ;
        this.radius = radius;
    }

}

module.exports = ViewerClient;