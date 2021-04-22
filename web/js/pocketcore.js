var socket = null;

function connectPocketCore(address) {
    // Create WebSocket connection.
    socket = new WebSocket(address);

    // Connection opened
    socket.addEventListener('open', function (event) {
        socket.send(JSON.stringify({ 'type': 'subscribe' }));

        console.log('connected to pocketcore');
    });

    // Listen for messages
    socket.addEventListener('message', handlePocketcorePacket);
}

function handlePocketcorePacket(event) {
    let response = JSON.parse(event.data);
    // console.log(response);

    switch (response.type) {
        case 'message':
            console.log('Got message: ' + response.body.message);
            // TODO: Make message box

            break;
        case 'chunk':
            recieveChunk(response.body.chunk);
            // console.log('Recieved chunkX: ' + response.body.chunk.x + ', chunkZ: ' + response.body.chunk.z);
            break;

        case 'level':
            recieveChunks(response.body.chunks);
            // console.log('Recieved chunks in bulk, size: ' + floor(response.body.chunks.length) + ' bytes');
            break;

        case 'player.join':
            console.log(response.body);

            console.log('Player ' + response.body.name + ' has joined');

            addPlayer(response.body.eid, {
                name: response.body.name,
                eid: response.body.eid,
                position: response.body.position
            });

            break;

        case 'player.leave':
            console.log('Player ' + response.body.name + ' has left. Reason: '.response.body.reason);

            removePlayer(response.body.eid);
            break;

        case 'entity.position':
            updatePosition(response.body.eid, response.body.position);
            break;

        default:
            console.error('unhandled response: ' + response.type);
            break;
    }
    
}