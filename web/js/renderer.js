var scl = 5;

var depthBrightness = 80;
var depthBlendMode;
var depthAlphaOffset = 5;


var showZoomPath = true;
var showGridOverlay = true;
var showBufferOutlines = true;
var showCoordinates = true;
var showPlayers = true;
var showAxis = true;
var showCenter = true;

const RenderSettings = {}
// Pixels per block
RenderSettings.BLOCK_RESOLUTION = 1;
// Chunk size in pixels
RenderSettings.CHUNK_SIZE = 16 * RenderSettings.BLOCK_RESOLUTION;
// Buffer width in chunks
RenderSettings.CHUNKS_IN_BUFFER = 16; // 2x2 = 4
// Total Buffer size in pixels
RenderSettings.BUFFER_SIZE = RenderSettings.CHUNKS_IN_BUFFER * RenderSettings.CHUNK_SIZE;

const renderer = {

    BlockPainter: null,

    Buffer: {

        BLOCK_RESOLUTION: RenderSettings.BLOCK_RESOLUTION,
        CHUNK_SIZE: RenderSettings.CHUNK_SIZE,
        SIZE: RenderSettings.BUFFER_SIZE,

        loaded: [],
        cachedVisibility: [],

        hash(bufferX, bufferY) {
            return bufferX + ':' + bufferY;
        },

        getFor(worldX, worldY, create = true) {
            let i = floor((worldX * RenderSettings.BLOCK_RESOLUTION) / RenderSettings.BUFFER_SIZE);
            let j = floor((worldY * RenderSettings.BLOCK_RESOLUTION) / RenderSettings.BUFFER_SIZE);

            let buff = renderer.Buffer.loaded[renderer.Buffer.hash(i, j)];

            if (buff) {
                return buff;
            }

            if (!create) {
                return null;
            }

            buff = createGraphics(RenderSettings.BUFFER_SIZE, RenderSettings.BUFFER_SIZE);
            buff.noStroke();

            buff.i = i;
            buff.j = j;

            renderer.Buffer.loaded[renderer.Buffer.hash(i, j)] = buff;

            return buff;
        },

        visible(clearCache = false) {
            if(renderer.Buffer.cachedVisibility && !clearCache) {
                return renderer.Buffer.cachedVisibility
            }

            let visible = Object.values(renderer.Buffer.loaded).filter((buffer) => {
                let lx = buffer.i * RenderSettings.BUFFER_SIZE * renderer.scl + renderer.offsetX + renderer.tempOffsetX;
                let ly = buffer.j * RenderSettings.BUFFER_SIZE * renderer.scl + renderer.offsetY + renderer.tempOffsetY;
                let rx = lx + buffer.width * renderer.scl;
                let ry = ly + buffer.height * renderer.scl;

                // fill('red');
                // noStroke();

                // push();
                // translate(width / 2 - 15, height / 2 - 15);
                // // TOP
                // stroke(ry < 0 ? 'green' : 'red'); 
                // line(0, 0, 30, 0);
                // // RIGHT
                // stroke(0 > rx ? 'green' : 'red');
                // line(30, 0, 30, 30);
                // // BOTTOM
                // stroke(ly > height ? 'green' : 'red');
                // line(30, 30, 0, 30);
                // // LEFT
                // stroke(lx > width ? 'green' : 'red');
                // line(0, 30, 0, 0);
                // pop();

                // return (ry < 0 && 0 > rx && ly > height && lx > width);

                return (ry > 0 && 0 < rx && ly < height && lx < width);
            });

            renderer.Buffer.cachedVisibility = visible;

            return visible;
        }

    },

    scl: scl,

    offsetX: 0,
    offsetY: 0,

    tempOffsetX: 0,
    tempOffsetY: 0,

    mapIcons: null,

    minecraftFont: null,

    setup: () => {
        renderer.BlockPainter = new FlatColorBlockPainter();
        // renderer.BlockPainter = new TexturedBlockPainter();

        renderer.offsetX = width / 2;
        renderer.offsetY = height / 2;

        // TODO: move to preload
        loadImage('/assets/map_icons.png', (img) => {
            renderer.mapIcons = img;
        });

        loadFont('/assets/minecraft_font.otf', (font) => {
            renderer.minecraftFont = font;
            textFont(font);
        })
    },

    render: () => {

        renderer.Buffer.visible(true).forEach((buffer) => {
                push();

                translate(
                    buffer.i * RenderSettings.BUFFER_SIZE * renderer.scl + renderer.offsetX + renderer.tempOffsetX,
                    buffer.j * RenderSettings.BUFFER_SIZE * renderer.scl + renderer.offsetY + renderer.tempOffsetY
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
                // rect(0, 0, RenderSettings.BUFFER_SIZE * renderer.scl, RenderSettings.BUFFER_SIZE * renderer.scl);

                pop();
            });

        // Render grid overlay
        if(showGridOverlay) renderer.renderGridOverlay();
        if(showCoordinates) renderer.renderMouseCoordinates();
        if(showBufferOutlines) renderer.renderBufferOutlines();
        if(showAxis) renderer.renderAxis();
        if(showPlayers) renderer.drawPlayers();
        if(showCenter) renderer.renderCenter();
    },

    magic: 32,

    renderChunk: (chunk) => {
        return new Promise((resolve, reject) => {
            try {
                var buffer = renderer.Buffer.getFor(chunk.x << 4, chunk.z << 4);

                // Quadrant II & III
                let i = buffer.i < 0 ? -1 : 1;
                // Quadrant I  & IV
                let j = buffer.j < 0 ? -1 : 1;

                var chunkBufferX = Math.abs(((chunk.x + (i < 0 ? 1 : 0)) % 16) << 4) * RenderSettings.BLOCK_RESOLUTION;
                var chunkBufferZ = Math.abs(((chunk.z + (j < 0 ? 1 : 0)) % 16) << 4) * RenderSettings.BLOCK_RESOLUTION;

                // Left
                if (i < 0) {
                    chunkBufferX = buffer.width - chunkBufferX - RenderSettings.CHUNK_SIZE;
                }

                // Top
                if (j < 0) {
                    chunkBufferZ = buffer.height - chunkBufferZ - RenderSettings.CHUNK_SIZE;
                }

                for (let x = 0; x < 16; x++) {
                    for (let z = 0; z < 16; z++) {
                        let blockId = Object.values(chunk.layer[x][z])[0];
                        let y = Object.keys(chunk.layer[x][z])[0];

                        renderer.BlockPainter.paint(
                            buffer, 
                            chunkBufferX + (x * renderer.Buffer.BLOCK_RESOLUTION), 
                            y, 
                            chunkBufferZ + (z * renderer.Buffer.BLOCK_RESOLUTION), 
                            blockId
                        );

                        if (chunkBufferX + (x * renderer.Buffer.BLOCK_RESOLUTION) >= buffer.width) {
                            console.log(`Outside buffer rendering on x axis detected. (Target: ${chunkBufferX + x}) (Buffer: ${buffer.i}, ${buffer.j}) (Chunk: ${chunk.x}, ${chunk.z})`);
                        }
                        if (chunkBufferZ + (z * renderer.Buffer.BLOCK_RESOLUTION) >= buffer.height) {
                            console.log(`Outside buffer rendering on y axis detected. (Target: ${chunkBufferZ + z}) (Buffer: ${buffer.i}, ${buffer.j}) (Chunk: ${chunk.x}, ${chunk.z})`);
                        }
                    }
                }

                resolve(buffer);
            } catch (exception) {
                reject(exception);
            }
        });
    },

    renderGridOverlay: () => {
        var chunkSize = RenderSettings.CHUNK_SIZE * (renderer.scl);
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
        noFill();
        stroke('green');
        strokeWeight(2);
        Object.values(renderer.Buffer.loaded).forEach(buffer => {
            push();

            translate(
                buffer.i * RenderSettings.BUFFER_SIZE * renderer.scl + renderer.offsetX + renderer.tempOffsetX,
                buffer.j * RenderSettings.BUFFER_SIZE * renderer.scl + renderer.offsetY + renderer.tempOffsetY
            );

            noFill();
            stroke('green');
            strokeWeight(2);
            rect(0, 0, RenderSettings.BUFFER_SIZE * renderer.scl, RenderSettings.BUFFER_SIZE * renderer.scl);

            pop();
        });
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
            if (!player) return;

            push();
            let coords = worldToCanvas(player.position.x, player.position.z, true);

            // Move the origin to player pos
            translate(coords[0], coords[1]);

            if (player.position.yaw !== undefined) {
                rotate(radians(player.position.yaw - 180));
            }

            image(renderer.mapIcons, -16, -16, 32, 32, 0, 0, 16, 16);

            pop();
        });
    },

    renderCenter: () => {
        push();
        strokeWeight(4);
        stroke('#fff');
        point(width / 2, height / 2);
        pop();
    },

    renderMouseCoordinates: () => {
        noStroke();
        fill('#FFF');
        textSize(12);
        textAlign(LEFT);
        let padding = 2;

        // World Coordinates
        let coord = canvasToWorld(mouseX, mouseY);
        let txt = `[${coord[0]}, ${coord[2]}, ${coord[1]}]`;
        fill('#000');
        rect(mouseX + 18, mouseY - 30, textWidth(txt) + 4, 24);
        fill('#fff');
        text(txt, mouseX + 20, mouseY - 20);
        

        // Chunk Coordinates
        let cx = coord[0] >> 4;
        let cy = coord[1] >> 4;
        txt = `[${cx}, ${cy}]`;
        text(txt, mouseX + 20, mouseY - 8);

        // Block ID
        let bid = getBlockIdAt(coord[0], coord[1]);
        if (bid) {
            let txt = `[Block ID: ${bid ?? null}]`;
            fill('#000');
            rect(mouseX + 18, mouseY + 8, textWidth(txt) + 4, 12);
            fill('#fff');
            text(txt, mouseX + 20, mouseY + 18);
        }
    },

}