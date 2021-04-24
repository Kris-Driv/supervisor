var scl = 5;

var drawOverlay = true;
var drawPlayers = true;
var drawDepth = false;

var depthBrightness = 80;
var depthBlendMode;
var depthAlphaOffset = 5;

const renderer = {

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

    bufferIncreaseOnOverflow: 160,

    setup: () => {
        depthBlendMode = BURN;
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

                noFill();
                stroke('green');
                strokeWeight(2);
                rect(0, 0, renderer.Buffer.SIZE * renderer.scl, renderer.Buffer.SIZE * renderer.scl);

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
        var buffer = renderer.Buffer.getFor(chunk.x << 4, chunk.z << 4);
        var cx = (chunk.x % 16) << 4;
        var cz = (chunk.z % 16) << 4;

        buffer.fill('red');

        for (var x = 0; x < 16; x++) {
            for (var z = 0; z < 16; z++) {
                let blockId = Object.values(chunk.layer[x][z])[0];
                let blockColor = renderer.getBlockColor(blockId);

                buffer.fill(blockColor);
                buffer.rect(cx + x, cz + z, 1);
            }
        }
    },

    renderChunkDepthBuffer: (chunk) => {
        let y, alpha;
        let chunkX = chunk.x;
        let chunkZ = chunk.z;

        depthBufferImage.noStroke();
        for (var x = 0; x < 16; x++) {
            for (var z = 0; z < 16; z++) {
                y = Object.keys(chunk.layer[x][z])[0];
                // Calculate alpha based on the height
                // map(value, start1, stop1, start2, stop2, [withinBounds])
                if (y <= 64) {
                    if (y <= 60) {
                        if (y <= 54) {
                            alpha = map(y, 54, 20, 90, 160);
                        } else {
                            alpha = map(y, 60, 50, 68, 240);
                        }
                    } else {
                        alpha = map(y, 64, 48, 68, 240);
                    }
                } else {
                    if (y >= 90) {
                        if (y >= 91 && y <= 92) {
                            alpha = map(y, 91, 92, 10, 30);
                        } else {
                            alpha = map(y, 90, 110, 55, 5);
                        }
                    } else {
                        if (y >= 72 && y <= 84) {
                            if (y >= 74 && y <= 75) {
                                alpha = map(y, 74, 75, 30, 60);
                            } else {
                                alpha = map(y, 72, 84, 140, 90);
                            }
                        } else {
                            if (y >= 87 && y <= 89) {
                                alpha = map(y, 87, 89, 30, 60);
                            } else {
                                alpha = map(y, 64, 90, 80, 70);
                            }
                        }
                    }
                }

                depthBufferImage.fill(color(depthBrightness, depthBrightness, depthBrightness, alpha + depthAlphaOffset));

                depthBufferImage.rect(
                    (chunkX * 16 * scl) + (x * scl),
                    (chunkZ * 16 * scl) + (z * scl),
                    scl, scl
                );
            }
        }
    },

    renderGridOverlay: () => {
        var chunkSize = 16 * (renderer.scl);
        var xOff = (renderer.offsetX + renderer.tempOffsetX) % chunkSize;
        var yOff = (renderer.offsetY + renderer.tempOffsetY) % chunkSize;
        var xSize = floor(width / chunkSize) + 1;
        var zSize = floor(height / chunkSize) + 1;

        noFill();
        stroke(40);
        strokeWeight(1);



        for (x = 0; x < xSize; x++) {
            for (z = 0; z < zSize; z++) {
                rect(x * chunkSize + xOff, z * chunkSize + yOff, chunkSize, chunkSize);
            }
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

    blockColorMap: {
        // Grass
        // '2': '#00b894',
        // Snow
        '78': '#dfe6e9',
        // Stone
        '1': '#636e72',
        // Some plants
        // '31': '#78e08f',
        // Oak leaves
        '18': '#009432',
        // Water
        '9': '#0652DD',
        // Sand
        '12': '#ffeaa7',
        // Dead bush
        //'31': '#cc8e35',
        // Dirt
        '3': '#f0932b',
        // Pink clay
        '159': '#edcecc',
        // Poppy
        //'38': '#8a140c',
        // Brown mushroom
        //'39': '#cc8d60',
        // Sunflower
        //'175': '#ffe100',
        // Hardened Clay
        '172': '#c97947',
        // Acacia leaves
        '161': '#78e08f',
        // Ice
        '79': '#74b9ff',
        // Packed ice (darker?)
        '174': '#0984e3',
    },

    // Grass color
    fallbackBlockColor: '#00b894',

    getBlockColor: (blockId) => {
        return renderer.blockColorMap[blockId] ?? ((id) => {

            // console.log('unknown block ' + id);
            return renderer.fallbackBlockColor;

        })(blockId);
    }

}