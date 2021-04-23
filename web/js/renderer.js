var scl = 5;

var depthBufferImage;
var responsiveMapBufferImage;
var bigMapBufferImage;

var drawOverlay = true;
var drawPlayers = true;
var drawDepth = false;

var depthBrightness = 80;
var depthBlendMode;
var depthAlphaOffset = 5;

const renderer = {

    scl: scl,
    topScl: 0.5,

    offsetX: 0,
    offsetY: 0,

    tempOffsetX: 0,
    tempOffsetY: 0,

    setup: () => {
        // Create image buffer, this should be huge performance improvement
        // Currently we're drawing 1600 chunks at about 0.3 Frames per second
        responsiveMapBufferImage = createGraphics(width, height);
        bigMapBufferImage = createGraphics(width, height);
        depthBufferImage = createGraphics(width, height);

        responsiveMapBufferImage.noStroke();
        bigMapBufferImage.noStroke();

        depthBlendMode = BURN;

        // renderer.offsetX = width / 2;
        // renderer.offsetY = height / 2;
    },

    render: () => {
        // Draw Map buffer
        image(responsiveMapBufferImage, 
            // Position
            renderer.offsetX + renderer.tempOffsetX, 
            renderer.offsetY + renderer.tempOffsetY, 
            // Size (zoom etc.)
            width * renderer.scl, 
            height * renderer.scl
        );

        image(bigMapBufferImage, width - 100, height - 100, 100, 100);

        // And depth shading
        if (drawDepth) {
            push();
            blendMode(BURN);
            image(depthBufferImage, 0, 0, width * renderer.scl, height * renderer.scl);
            pop();
        }

        // Render grid overlay
        if (drawOverlay) {
            renderer.gridOverlay();
            renderer.mouseCoordinates();
        }

        if (drawPlayers) {
            renderer.drawPlayers();
        }
    },

    renderChunk: (chunk) => {
        responsiveMapBufferImage.fill('red');

        let coords = worldToBuffer(chunk.x << 4, chunk.z << 4);
        let cx = coords[0];
        let cy = coords[1];
        // responsiveMapBufferImage.rect(coords[0], coords[1], 16, 16);

        for (var x = 0; x < 16; x++) {
            for (var z = 0; z < 16; z++) {
                let blockId = Object.values(chunk.layer[x][z])[0];
                let blockColor = renderer.getBlockColor(blockId);

                responsiveMapBufferImage.fill(blockColor);
                responsiveMapBufferImage.rect(cx + x, cy + z, 1);

                bigMapBufferImage.fill(blockColor)
                bigMapBufferImage.rect(cx + x, cy + z, renderer.scl);
            }
        }

        // renderer.renderChunkDepthBuffer(chunk);
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
                        if(y >= 91 && y <= 92) {
                            alpha = map(y, 91, 92, 10, 30);
                        } else {
                            alpha = map(y, 90, 110, 55, 5);
                        }
                    } else {
                        if (y >= 72 && y <= 84) {
                            if(y >= 74 && y <= 75) {
                                alpha = map(y, 74, 75, 30, 60);
                            } else {
                                alpha = map(y, 72, 84, 140, 90);
                            }
                        } else {
                            if(y >= 87 && y <= 89) {
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

    gridOverlay: () => {
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
            let coords = worldToCanvas(player.position.x, player.position.z);

            ellipse(
                coords[0] + renderer.offsetX + renderer.tempOffsetX, 
                coords[1] + renderer.offsetY + renderer.tempOffsetY, 
                
                6, 6);
        });
    },

    mouseCoordinates: () => {
        noStroke();
        fill('#FFF');
        textSize(12);
        let coord = canvasToWorld(mouseX, mouseY);
        let txt = `[${coord[0]}, ${coord[2]}, ${coord[1]}]`;
        text(txt, mouseX + (txt.length * 12 / 5), mouseY);
        let bid = getBlockIdAt(coord[0], coord[1]);
        if(bid) {
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