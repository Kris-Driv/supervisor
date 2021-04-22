let chunks = [];

function recieveChunk(chunk) {
    // Update, if chunk in position
    chunks[chunk.x + ':' + chunk.z] = chunk;

    // Edit mapBufferImage buffer with this new chunk
    renderer.renderChunk(chunk);
}

function recieveChunks(chunksBase64) {
    let chunks = JSON.parse(atob(chunksBase64));

    console.log(chunks);

    for(let x = chunks.length - 1; x >= 0; x--) {
        for(let z = chunks[x].length - 1; z >= 0; z--) {
            let chunk = chunks[x][z];

            recieveChunk(chunk);
        }
    }
}