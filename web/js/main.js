function setup() {
    var cnv = createCanvas(640, 520);
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    cnv.position(x, y);

    // Prepare
    renderer.setup();

    // Create connection with pocketcore
    connectPocketCore('ws://localhost:27095');

    if(!socket) noLoop();
}

function draw() {
    background(51);

    renderer.render();
}

function canvasToWorld(canvasX, canvasY) {
    var worldX = canvasX * scl;
    var worldZ = canvasY * scl;
    var worldY = getWorldY(worldX, worldZ);
    return [worldX, worldZ, worldY];
}

function getWorldY(x, z) {
    let cx = x >> 4;
    let cz = z >> 4;
    let rx = x % 16;
    let rz = z % 16;
    // console.log({x, z, cx, cz, rx, rz});
    
    let chunk = chunks[cx + ':' + cz] ?? null;
    // console.log(chunk);
    if(chunk) {
        return Object.keys(chunk.layer[rx][rz] ?? [])[0] ?? 255;
    }
    return 255;
}

function getBlockIdAt(x, z) {
    let cx = x >> 4;
    let cz = z >> 4;
    let rx = x % 16;
    let rz = z % 16;
    // console.log({x, z, cx, cz, rx, rz});
    
    let chunk = chunks[cx + ':' + cz] ?? null;
    // console.log(chunk);
    if(chunk) {
        return Object.values(chunk.layer[rx][rz] ?? [])[0] ?? null;
    }
    return null;
}

function keyPressed() {
    if(keyCode === 32) drawOverlay = !drawOverlay;
}