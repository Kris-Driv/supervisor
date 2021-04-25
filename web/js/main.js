var anchor;
const defaultAddress = 'ws://localhost:27095';

function setup() {
    var cnv = createCanvas(920, 640);
    cnv.parent(document.getElementById('canvas-container'));
    cnv.mouseWheel(controlZoom);

    // Prepare
    renderer.setup();
    UI.setup();
}

function draw() {
    background('#1f1f1f');

    UI.update();
    renderer.render();
}

function controlZoom(event) {
    let zoom = event.deltaY / 100;

    renderer.scl += zoom;
    renderer.scl = max(0.5, min(renderer.scl, 5));

    event.preventDefault();
}

function canvasToWorld(canvasX, canvasY) {
    return [
        floor((canvasX - renderer.offsetX) * (1 / renderer.scl)),
        floor((canvasY - renderer.offsetY) * (1 / renderer.scl)),
        getWorldY(canvasX, canvasY)
    ];
}

function worldToCanvas(worldX, worldZ) {
    return [
        (worldX * renderer.scl),
        (worldZ * renderer.scl)
    ];
}

function worldToBuffer(worldX, worldZ) {
    return [worldX, worldZ];
}

function getWorldY(x, z) {
    return 0;
    let cx = x >> 4;
    let cz = z >> 4;
    let rx = x % 16;
    let rz = z % 16;
    // console.log({x, z, cx, cz, rx, rz});
    
    let chunk = chunks[cx + ':' + cz] ?? null;
    // console.log(chunk);
    if(chunk) {
        return Object.keys(chunk.layer[Math.floor(rx)][Math.floor(rz)] ?? [])[0] ?? 255;
    }
    return 255;
}

function mousePressed() {
    anchor = new p5.Vector(mouseX, mouseY);
}

function mouseDragged() {
    if ((mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0) === false) {
        mouseReleased();
        return;
    }

    let currentPos = new p5.Vector(mouseX, mouseY);
    let d = currentPos.sub(anchor);

    renderer.tempOffsetX = d.x;//(d.x * renderer.scl);
    renderer.tempOffsetY = d.y;//(d.y * renderer.scl);
}

function mouseReleased() {
    anchor = null;

    renderer.offsetX += renderer.tempOffsetX;
    renderer.offsetY += renderer.tempOffsetY;
    renderer.tempOffsetX = 0;
    renderer.tempOffsetY = 0;
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
        return '...'
        // return Object.values(chunk.layer[Math.floor(rx)][Math.floor(rz)] ?? [])[0] ?? null;
    }
    return null;
}

function keyPressed() {
    if(keyCode === 32) {
        drawOverlay = !drawOverlay;
        return false;
    }
}

function requestLevel() {
    UI.log('Requesting full level data ...');
    sendPacket('{"type": "level"}').then(() => {
        console.log('Sent the packet');
    });
}

function clearChunks() {
    chunks = [];
    responsiveMapBufferImage = createGraphics(width, height);
    depthBufferImage = createGraphics(width, height);
}