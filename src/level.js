const logger = require("./logger");
const Packet = require("./packet");

class Level {

    constructor(name = 'world') {
        logger.info(`Level cache for '${name}' initiated`);

        this.name = name;
        this.chunks = [];
    }

    setChunk(x, z, chunk) {
        if(!this.chunks[x]) {
            this.chunks[x] = [];
        }
        this.chunks[x][z] = chunk;
    }

    setChunks(chunks) {
        chunks.forEach(chunk => {
            this.setChunk(chunk.x, chunk.z, chunk);
        });
    }

    toPacket() {
        return Packet.Level.encode(this.name, this.chunks);
    }

}

// Export the class
module.exports = Level;