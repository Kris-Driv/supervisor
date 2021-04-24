var scl = 5;

var drawOverlay = true;
var drawPlayers = true;

var depthBrightness = 80;
var depthBlendMode;
var depthAlphaOffset = 5;

const renderer = {

    BlockPainter: null,

    Buffer: {
        SIZE: (16 * 16),
        loaded: [],

        getFor(worldX, worldY, create = true) {
            let i = floor(worldX / renderer.Buffer.SIZE);
            let j = floor(worldY / renderer.Buffer.SIZE);

            if (renderer.Buffer.loaded[i] === undefined) {
                renderer.Buffer.loaded[i] = [];
            }

            let buff = renderer.Buffer.loaded[i][j];

            if (buff) {
                return buff;
            }

            if (!create) {
                return null;
            }

            buff = createGraphics(renderer.Buffer.SIZE, renderer.Buffer.SIZE);
            buff.noStroke();

            buff.i = i;
            buff.j = j;

            renderer.Buffer.loaded[i][j] = buff;

            return buff;
        }
    },

    scl: scl,
    topScl: 0.5,

    offsetX: 0,
    offsetY: 0,

    tempOffsetX: 0,
    tempOffsetY: 0,

    setup: () => {
        renderer.BlockPainter = new FlatColorBlockPainter();
    },

    render: () => {

        renderer.Buffer.loaded.forEach((buffers, i) => {
            buffers.forEach((buffer, j) => {
                push();

                translate(
                    i * renderer.Buffer.SIZE * renderer.scl + renderer.offsetX + renderer.tempOffsetX,
                    j * renderer.Buffer.SIZE * renderer.scl + renderer.offsetY + renderer.tempOffsetY
                );

                // Draw Map buffer
                image(buffer, 0, 0,
                    // Size (zoom etc.)
                    buffer.width * renderer.scl,
                    buffer.height * renderer.scl
                );

                // noFill();
                // stroke('green');
                // strokeWeight(2);
                // rect(0, 0, renderer.Buffer.SIZE * renderer.scl, renderer.Buffer.SIZE * renderer.scl);

                pop();
            });
        });

        // Render grid overlay
        if (drawOverlay) {
            renderer.renderGridOverlay();
            renderer.renderMouseCoordinates();
            renderer.renderBufferOutlines();
            renderer.renderAxis();
        }

        if (drawPlayers) {
            renderer.drawPlayers();
        }
    },

    renderChunk: (chunk) => {
        return new Promise((resolve, reject) => {
            var buffer = renderer.Buffer.getFor(chunk.x << 4, chunk.z << 4);

            var cx = (chunk.x % 16) << 4;
            var cz = (chunk.z % 16) << 4;

            buffer.fill('red');

            for (var x = 0; x < 16; x++) {
                for (var z = 0; z < 16; z++) {
                    let blockId = Object.values(chunk.layer[x][z])[0];
                    let y = Object.keys(chunk.layer[x][z])[0];

                    renderer.BlockPainter.paint(buffer, cx + x, y, cz + z, blockId);
                }
            }

            resolve(buffer);
        })
    },
    
    renderGridOverlay: () => {
        var chunkSize = 16 * (renderer.scl);
        var xOff = (renderer.offsetX + renderer.tempOffsetX) % chunkSize;
        var yOff = (renderer.offsetY + renderer.tempOffsetY) % chunkSize;
        var linesInX = floor(width / chunkSize) + 1;
        var linesInY = floor(height / chunkSize) + 1;

        noFill();
        stroke(40);
        strokeWeight(1);

        for (let x = 0; x < linesInX; x++) {
            line(x * chunkSize + xOff, 0, x * chunkSize + xOff, height);
        }
        for (let y = 0; y < linesInY; y++) {
            line(0, y * chunkSize + yOff, width, y * chunkSize + yOff);
        }
    },

    renderBufferOutlines: () => {
        // noFill();
        // stroke('black');
        // rect(
        //     renderer.offsetX + renderer.tempOffsetX,
        //     renderer.offsetY + renderer.tempOffsetY,
        //     primaryBufferImage.width * renderer.scl,
        //     primaryBufferImage.height * renderer.scl
        // );
    },

    renderAxis: () => {
        stroke('red');
        strokeWeight(1);
        line(renderer.offsetX + renderer.tempOffsetX, 0, renderer.offsetX + renderer.tempOffsetX, height);

        stroke('blue');
        strokeWeight(1);
        line(0, renderer.offsetY + renderer.tempOffsetY, width, renderer.offsetY + renderer.tempOffsetY);
    },

    resetOffsets: () => {
        renderer.offsetX = 0;
        renderer.offsetY = 0;
        renderer.tempOffsetX = 0;
        renderer.tempOffsetY = 0;
    },

    drawPlayers: () => {
        noStroke();
        fill('red');
        players.forEach(player => {
            push();
            let coords = worldToCanvas(player.position.x, player.position.z);

            // Move the origin to player pos
            translate(coords[0] + renderer.offsetX + renderer.tempOffsetX, coords[1] + renderer.offsetY + renderer.tempOffsetY);

            // Better player drawing neccessary, can't tell where their pointing!
            ellipse(0, 0, 9, 9);

            if (player.position.yaw !== undefined) {
                stroke('#fff');
                strokeWeight(3);

                rotate(radians(player.position.yaw + 90));
                line(0, 0, 5, 0);
            }

            pop();
        });
    },

    renderMouseCoordinates: () => {
        noStroke();
        fill('#FFF');
        textSize(12);
        let coord = canvasToWorld(mouseX, mouseY);
        let txt = `[${coord[0]}, ${coord[2]}, ${coord[1]}]`;
        text(txt, mouseX + (txt.length * 12 / 5), mouseY);
        let bid = getBlockIdAt(coord[0], coord[1]);
        if (bid) {
            let txt = `[Block ID: ${bid}]`;
            text(txt, mouseX + (txt.length * 12 / 5), mouseY + 18);
        }
    },

}