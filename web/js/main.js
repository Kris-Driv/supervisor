function setup() {
    var cnv = createCanvas(640, 520);
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    cnv.position(x, y);

    // Prepare
    renderer.setup();
    UI.setup();

    // Create connection with pocketcore
    connectPocketCore('ws://localhost:27095');

    if(!socket) noLoop();
}

function draw() {
    background(51);

    UI.update();
    renderer.render();
}

function canvasToWorld(canvasX, canvasY) {
    return [
        floor(canvasX * (1 / renderer.scl)),
        floor(canvasY * (1 / renderer.scl)),
        getWorldY(canvasX, canvasY)
    ];
}

function worldToCanvas(worldX, worldZ) {
    return [
        floor(worldX * renderer.scl),
        floor(worldZ * renderer.scl)
    ];
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