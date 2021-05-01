const _LevelCacheStorageLogic = require('../../level/level_storage.js');
const coord_hash = require('../../utils/coord_hash.js');
const NetworkEntity = require('./network_entity.js');

class ViewerClient extends NetworkEntity {

    handleLoginPacket(packet) {
        this.name = packet.body.name ?? 'unknown';
        this.level = _LevelCacheStorageLogic.getCacheByName(packet.body.level);

        if(!this.level) {
            this.level = _LevelCacheStorageLogic.levels['test'];
        }

        this.worldX = 0;
        this.worldZ = 0;
        this.radius = 2;

        this.sectorsReceived = [];

        return true;
    }

    setLevel(level) {
        this.level = level;
    }

    canSee(worldX, worldZ) {
        let d = Math.sqrt(Math.abs((this.worldX - worldX) + (this.worldZ - worldZ)));
        return (d <= (this.radius << 8));
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

        let visibleSectors = this.visibleSectors();

        let result = visibleSectors.next();

        while (!result.done) {
            let sectorCoordinates = result.value;

            let hash = this.level.getSectorHash(sectorCoordinates);
            let curr = this.sectorsReceived[coord_hash(sectorCoordinates)];

            if(curr === undefined || hash !== curr) {
                let hash = this.level.sendSector(this, sectorCoordinates[0], sectorCoordinates[1]);

                this.sectorsReceived[coord_hash(sectorCoordinates)] = hash;
            }

            result = visibleSectors.next();
        }
    }

}

module.exports = ViewerClient;