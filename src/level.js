const logger = require("./logger");
const Packet = require("./packet");

class Level {

    constructor(name = 'world') {
        logger.info(`Level cache for '${name}' initiated`);

        this.name = name;
        this.chunks = [];

        this.cachedPacket = null;
    }

    clearChunks() {
        this.chunks = [];
    }

    setChunk(x, z, chunk) {
        if(!this.chunks[x]) {
            this.chunks[x] = [];
        }
        this.chunks[x][z] = chunk;

        this.cachedPacket = null;
    }

    setChunks(chunks) {
        chunks.forEach(chunk => {
            this.setChunk(chunk.x, chunk.z, chunk);
        });
    }

    toPacket() {
        if(this.cachedPacket) {
            return this.cachedPacket;
        }

        this.cachedPacket = Packet.Level.encode(this.name, this.chunks);
        return this.cachedPacket;
    }

}

// Export the class
module.exports = Level;