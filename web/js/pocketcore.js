var socket = null;

function connectPocketCore(address, onopen, onclose) {
    // Close previous
    if(socket) {
        socket.close();
        socket = null;
    }

    // Create WebSocket connection.
    socket = new WebSocket(address);

    // Connection opened
    socket.addEventListener('open', function (event) {
        socket.send(JSON.stringify({ 'type': 'subscribe' }));

        UI.log("Connected to " + address + " successfully!");
    });

    socket.addEventListener('close', () => {
        UI.log('Socket closed');
    });

    if(onopen) {
        socket.addEventListener('open', onopen);
    }
    if(onclose) {
        socket.addEventListener('close', onclose);
    }

    // Listen for messages
    socket.addEventListener('message', handlePocketcorePacket);
}

function handlePocketcorePacket(event) {
    let response = JSON.parse(event.data);
    // console.log(response);

    switch (response.type) {
        case 'message':
            console.log('[PocketCore]: ' + response.body.message);
            // TODO: Make message box

            break;
        case 'chunk':
            recieveChunk(response.body.chunk);
            UI.log('Recieved chunkX: ' + response.body.chunk.x + ', chunkZ: ' + response.body.chunk.z);
            break;

        case 'level':
            UI.log('Recieved level data: ' + response.body.chunks.length);
            recieveChunks(response.body.chunks);
            recieveEntities(response.body.entities);
            // console.log('Recieved chunks in bulk, size: ' + floor(response.body.chunks.length) + ' bytes');
            break;

        case 'player.join':
            UI.log('Player ' + response.body.name + ' has joined the game');

            addPlayer(response.body.eid, {
                name: response.body.name,
                eid: response.body.eid,
                position: response.body.position
            });

            break;

        case 'player.leave':
            UI.log('Player ' + response.body.name + ' has left game');

            removePlayer(response.body.eid);
            break;

        case 'entity.position':
            updatePosition(response.body.eid, response.body.position);
            break;

        default:
            UI.log('unhandled response: ' + response.type);

            break;
    }
    
}