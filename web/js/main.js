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