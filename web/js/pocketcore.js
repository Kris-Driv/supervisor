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
        socket.send(JSON.stringify({ 'type': 'login.viewer', 'body': { 'name': 'Viewer', 'level': null } }));

        UI.log("Connected to " + address + " successfully!");
    });

    socket.addEventListener('close', () => {
        socket = null;

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

const sendViewPortPacket = () => {
    if(socket === null) return;

    sendPacket({
        type: 'viewport',
        body: renderer.ViewPort.toPacket()
    });
    
    setTimeout(sendViewPortPacket, 1000);
};

function handlePocketcorePacket(event) {
    let response = JSON.parse(event.data);
    let player;
    // console.log(response);

    switch (response.type) {
        case 'login.viewer':
            if(response.body.status !== true) {
                UI.log('Authentication failed');
                socket.close();
            } else {
                UI.log('Authentication successful!');
                sendViewPortPacket();
            }

            break;

        case 'viewport':
            renderer.ViewPort.moveTo(response.body.worldX, response.body.worldZ);
            break;

        case 'close':
            UI.log('Connection was close, reason: ' + response.body.reason);
            break;

        case 'info':
            let viewerCount = response.body.viewerCount;
            UI.statsViewersCount.innerHTML = viewerCount;

            break;

        case 'message':
            UI.log(response.body.message);

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

        case 'player.message':
            console.log(response);

            player = getPlayer(response.body.eid);
            if(player) {
                UI.log(`${player.name}: ${response.body.message}`);
            }
            break;
            
        case 'player.join':
            UI.log('Player ' + response.body.name + ' has joined the game');

            if(!response.body.position) {
                UI.log('Player rejected for not having position');
                return;
            }
            if(!response.body.eid) {
                UI.log('Player rejected for not having EID');
                return;
            }

            addPlayer(response.body.eid, {
                name: response.body.name,
                eid: response.body.eid,
                position: response.body.position,
                face: null
            });

            break;

        case 'player.leave':
            UI.log('Player ' + response.body.name + ' has left game');

            removePlayer(response.body.eid);
            break;

        case 'player.face':
            player = getPlayer(response.body.eid);
            if(!player) {
                UI.log('Got face for invalid player');
                return;
            }
            UI.log('Got face for player: ' + player.name);

            handleFaceUpdate(player.eid, response.body.pixelArray);

            break;

        case 'entity.position':
            updatePosition(response.body.eid, response.body.position);
            break;

        default:
            UI.log('unhandled response: ' + response.type);

            break;
    }
    
}

function sendPacket(packet, callback = null) {
    return new Promise((resolve) => {
        socket.send(JSON.stringify(packet));

        resolve();
    }).then(callback);
}