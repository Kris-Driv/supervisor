let chunks = [];

function refresh() {
    chunks.forEach(chunk => renderer.renderChunk(chunk));
}

function recieveChunk(chunk) {
    try {
        validateChunk(chunk);
    } catch(error) {
        return UI.log(`Invalid ${describeChunk(chunk)}:` + error);
        // throw error;
    }

    // Edit mapBufferImage buffer with this new chunk
    renderer.renderChunk(chunk).then(() => {
        // Chunk rendered, save
        chunks[chunk.x + ':' + chunk.z] = chunk;
    }).catch(error => {
        UI.log(`Error rendering ${describeChunk(chunk)}: ` + error);
        throw error;
    });
}

function describeChunk(chunk) {
   return `chunk[` + (chunk ? `${chunk.x ?? '?'},${chunk.z ?? '?'}` : `?`) + `]`;
}

function validateChunk(chunk) {
    if(chunk === undefined) {
        throw 'undefined given';
    }
    if(chunk === null) {
        throw 'null given';
    }
    if(chunk.x === undefined) {
        throw 'chunk x coordinate was not given';
    }
    if(chunk.z === undefined) {
        throw 'chunk z coordinate was not given';
    }
    if(chunk.layer === undefined) {
        throw 'chunk layer was not given';
    }
}

function recieveChunks(chunksBase64) {
    (new Promise((resolve, reject) => {
        try {
            let chunks = JSON.parse(atob(chunksBase64));

            resolve(chunks);
        } catch (e) {
            reject(e);
        }
    })).then((chunks) => {
        (new Promise((resolve, reject) => {
            try {
                chunks.forEach(chunk => recieveChunk(chunk));
                resolve();
            } catch (e) {
                reject(e);
            }
        })).then(() => {
            console.log('Chunks passed to renderer');
        });
    }).catch(err => {
        console.err(err);
    });
}

function getBlockIdAt(x, z) {
    let chunk = getChunk(x, z);
    let rx = Math.abs(x % 16);
    let rz = Math.abs(z % 16);


    if(chunk) {
        try {
            return Object.values(chunk.layer[rx][rz])[0] ?? '?';
        } catch (e) {
            return '!';
        }
    }
    return null;
}

function getChunk(worldX, worldZ) {
    return chunks[(worldX >> 4) + ':' + (worldZ >> 4)];
}