var scl = 1;

var depthBufferImage;
var mapBufferImage;

var drawOverlay = true;
var drawPlayers = true;

const renderer = {

    setup: () => {
        // Create image buffer, this should be huge performance improvement
        // Currently we're drawing 1600 chunks at about 0.3 Frames per second
        mapBufferImage = createGraphics(width, height);
        depthBufferImage = createGraphics(width, height);
    },

    render: () => {
        // Draw Map buffer
        image(mapBufferImage, 0, 0, width, height);

        // And depth shading
        image(depthBufferImage, 0, 0, width, height);

        // Render grid overlay
        if (drawOverlay) {
            renderer.gridOverlay();
            renderer.mouseCoordinates();
        }

        if(drawPlayers) {
            renderer.drawPlayers();
        } 
    },

    renderChunk: (chunk) => {
        let blockId;
        let chunkX = chunk.x;
        let chunkZ = chunk.z;
        let layer = chunk.layer;

        mapBufferImage.noStroke();
        for (var x = 0; x < 16; x++) {
            for (var z = 0; z < 16; z++) {
                blockId = layer[x][z];

                mapBufferImage.fill(renderer.getBlockColor(blockId));

                mapBufferImage.rect(
                    (chunkX * 16 * scl) + (x * scl),
                    (chunkZ * 16 * scl) + (z * scl),
                    scl, scl
                );
            }
        }

        renderer.renderChunkDepthBuffer(chunk);
    },

    renderChunkDepthBuffer: (chunk) => {
        console.log(chunk);
        let y, alpha;
        let chunkX = chunk.x;
        let chunkZ = chunk.z;
        
        depthBufferImage.noStroke();
        for (var x = 0; x < 16; x++) {
            for (var z = 0; z < 16; z++) {
                y = random(60, 84); // Find a way to transfer real y value
                // Calculate alpha based on the height
                // map(value, start1, stop1, start2, stop2, [withinBounds])
                alpha = map(y, 0, 256, 10, 170);

                depthBufferImage.fill(color(0, 0, 0, alpha));

                depthBufferImage.rect(
                    (chunkX * 16 * scl) + (x * scl),
                    (chunkZ * 16 * scl) + (z * scl),
                    scl, scl
                );
            }
        }
    },

    gridOverlay: () => {
        var chunkSize = 16 * scl;
        var xSize = floor(width / 16)
        var zSize = floor(height / 16);

        noFill();
        stroke('#000');

        for (x = 0; x < xSize; x++) {
            for (z = 0; z < zSize; z++) {
                rect(x * chunkSize, z * chunkSize, chunkSize, chunkSize);
            }
        }
    },

    drawPlayers: () => {
        noStroke();
        fill('red');
        players.forEach(player => {
            ellipse(player.position.x, player.position.y, 6, 6);
        });
    },

    mouseCoordinates: () => {
        noStroke();
        fill('#FFF');
        textSize(12);
        let coord = canvasToWorld(mouseX, mouseY);
        let txt = `[${coord[0]}, ${coord[1]}]`;
        text(txt, mouseX + (txt.length * 12 / 5), mouseY);
    },

    blockColorMap: {
        // Grass
        '2': '#00b894',
        // Snow
        '78': '#dfe6e9',
        // Stone
        '1': '#636e72',
        // Some plants
        '31': '#78e08f',
        // Oak leaves
        '18': '#009432',
        // Water
        '9': '#0652DD',
        // Sand
        '12': '#ffeaa7',
        // Dead bush
        '31': '#cc8e35',
        // Dirt
        '3': '#f0932b',
        // Pink clay
        '159': '#edcecc',
        // Poppy
        '38': '#8a140c',
        // Brown mushroom
        '39': '#cc8d60',
        // Sunflower
        '175': '#ffe100',
        // Hardened Clay
        '172': '#c97947',
        // Acacia leaves
        '161': '#78e08f',
    },

    getBlockColor: (blockId) => {
        return renderer.blockColorMap[blockId] ?? ((id) => {

            console.log('unknown block ' + id);
            return 'red';

        })(blockId);
    }

}