let chunks = [];

function refresh() {
    chunks.forEach(chunk => renderer.renderChunk(chunk));
}

function recieveChunk(chunk) {
    try {
        validateChunk(chunk);
    } catch(error) {
        return UI.log(`Invalid ${describeChunk(chunk)}:` + error);
    }

    renderer.renderChunk(chunk);
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
                // chunks.forEach(chunk => recieveChunk(chunk));

                renderer.renderChunkBatchAsync(chunks).then(() => {
                    UI.log('Batch rendered asynchronously');
                }).catch(err => {
                    UI.log('Error rendering chunks in batch asynchronously: ' + err);
                    reject(err);
                });

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

function getWorldY(x, z) {
    return 0;
    let cx = x >> 4;
    let cz = z >> 4;
    let rx = x % 16;
    let rz = z % 16;
    // console.log({x, z, cx, cz, rx, rz});

    let chunk = chunks[cx + ':' + cz] ?? null;
    // console.log(chunk);
    if (chunk) {
        return Object.keys(chunk.layer[Math.floor(rx)][Math.floor(rz)] ?? [])[0] ?? 255;
    }
    return 255;
}