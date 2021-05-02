var players = [];
var entities = [];

function addPlayer(eid, player) {
    if(!eid) {
        UI.error('invalid eid');
        return;
    }
    if(!player.position) {
        UI.error('cant add player without position');
        return;
    }

    players[eid] = player;

    if(player.face) {
        handleFaceUpdate(eid, player.face);
    }
}

function handleFaceUpdate(eid, pixelArray) {
    player = getPlayer(eid);
    player.face = new Face(atob(pixelArray));
}

function removePlayer(eid, player) {
    if(players[eid]) {
        // TODO, resets keys unnecessary
        players.splice(eid, 1);
    }
}

function getPlayer(eid) {
    return players[eid];
} 

function updatePosition(eid, position) {
    if(players[eid]) {
        players[eid].position = position;
    }

    if(followPlayer === eid) {
        renderer.ViewPort.moveTo(position.x, position.z);
    }
}

function recieveEntities(entities) {
    entities.forEach(entity => {
        if(!entity) {
            return;
        }

        if(!entity.type) {
            return;
        }

        if(!entity.eid) {
            return;
        }
        
        if(entity.type === 'player') {
            addPlayer(entity.eid, entity);
            UI.log(`Added Player Entity (${entity.name}) to the list`);
            return;
        }

        UI.log('Unknown entity type: ' + (entity.type ?? 'INVALID' ));
    });
}