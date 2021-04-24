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