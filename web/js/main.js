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

function canvasToWorld(x, y) {
    return [
        x * scl,
        y * scl
    ];
}

function keyPressed() {
    if(keyCode === 32) drawOverlay = !drawOverlay;
}