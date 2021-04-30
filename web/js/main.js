var anchor;
var afterRender = [];
var beforeRender = [];

const defaultAddress = 'ws://localhost:27095';

function setup() {
    var cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent(document.getElementById('canvas-container'));

    cnv.mouseWheel(UI.controlZoom);
    cnv.mousePressed(UI.mousePressed);

    mousePressed = UI.mousePressed;
    keyPressed = UI.keyPressed;
    mouseDragged = UI.mouseDragged;
    mouseReleased = UI.mouseReleased;

    // Prepare
    renderer.setup();
    UI.setup();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background('#1f1f1f');

    beforeRender.forEach(cb => cb());
    beforeRender = [];

    UI.update();
    renderer.render();

    afterRender.forEach(cb => cb());
    afterRender = [];
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
    if (chunk) {
        return Object.keys(chunk.layer[Math.floor(rx)][Math.floor(rz)] ?? [])[0] ?? 255;
    }
    return 255;
}

function requestLevel() {
    UI.log('Requesting full level data ...');
    sendPacket('{"type": "level"}').then(() => {
        console.log('Sent the packet');
    });
}

function clearChunks() {
    chunks = [];
}