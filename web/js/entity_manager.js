var players = [];

function addPlayer(eid, player) {
    players[eid] = player;
}

function removePlayer(eid, player) {
    players[eid] = player;
}

function updatePosition(eid, position) {
    players[eid].position = position;
}

function recieveEntities(entities) {
    entities.forEach(entity => {
        if(!entity) {
            return;
        }

        if(!entity.type) {
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