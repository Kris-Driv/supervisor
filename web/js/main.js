var anchor;
var afterRender = [];

var showZoomPath = true;
var showGridOverlay = true;
var showBufferOutlines = true;
var showCoordinates = true;
var showPlayers = true;
var showAxis = true;

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

    afterRender.forEach(cb => cb());
    afterRender = [];
}

let zoomPath = [];

function controlZoom(event) {
    let zoom = event.deltaY / 100;

    let middle = canvasToWorld(width / 2, height / 2);

    renderer.scl += zoom;
    renderer.scl = max(0.5, min(renderer.scl, 5));

    let old = worldToCanvas(middle[0], middle[1], true);
    zoomPath.push(old);

    event.preventDefault();

    if (zoomPath.length > 20) zoomPath.shift();

    if(!showZoomPath) return;
    afterRender.push(() => {
        stroke('#fff');
        for (var i = zoomPath.length - 1; i >= 0; i--) {
            let last = zoomPath[i + 1];
            if (!last) continue;
            let curr = zoomPath[i];

            line(last[0], last[1], curr[0], curr[1]);
        }
    });
}

function canvasToWorld(canvasX, canvasY) {
    return [
        floor( ((canvasX - renderer.offsetX) * (1 / renderer.scl)) / RenderSettings.BLOCK_RESOLUTION),
        floor( ((canvasY - renderer.offsetY) * (1 / renderer.scl)) / RenderSettings.BLOCK_RESOLUTION),
        getWorldY(canvasX, canvasY)
    ];
}

function worldToCanvas(worldX, worldZ, offset = true) {
    return [
        (worldX * renderer.scl) + (offset ? renderer.offsetX + renderer.tempOffsetX : 0),
        (worldZ * renderer.scl) + (offset ? renderer.offsetY + renderer.tempOffsetY : 0)
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
    if (chunk) {
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

function keyPressed() {
    if (keyCode === 32) {
        showGridOverlay = !showGridOverlay;
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
}