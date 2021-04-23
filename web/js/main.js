var anchor;

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
        worldX, //* renderer.scl,
        worldZ //* renderer.scl
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
        return Object.values(chunk.layer[Math.floor(rx)][Math.floor(rz)] ?? [])[0] ?? null;
    }
    return null;
}

function keyPressed() {
    if(keyCode === 32) drawOverlay = !drawOverlay;
}
