var players = [
    { name: "Test Subject", position: { x: 0, y: 0, z: 0, yaw: 0, pitch: 0 } }
];

function addPlayer(eid, player) {
    players[eid] = player;
}

function removePlayer(eid, player) {
    players[eid] = player;
}

function updatePosition(eid, position) {
    players[eid].position = position;
}