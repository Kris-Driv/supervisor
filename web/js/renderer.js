var scl = 5;

var showGridOverlay = true;
var showBufferOutlines = true;
var showCoordinates = true;
var showPlayers = true;
var showAxis = true;
var showCrosshair = true;
var showFps = true;

const RenderSettings = {}
// Pixels per block
RenderSettings.BLOCK_RESOLUTION = 1;
// Chunk size in pixels
RenderSettings.CHUNK_SIZE = 16 * RenderSettings.BLOCK_RESOLUTION;
// Buffer width in chunks
RenderSettings.CHUNKS_IN_BUFFER = 16; // 2x2 = 4
// Total Buffer size in pixels
RenderSettings.BUFFER_SIZE = RenderSettings.CHUNKS_IN_BUFFER * RenderSettings.CHUNK_SIZE;
// How many chunks can be rendererd per frame
RenderSettings.CHUNK_RENDER_RATE = 1;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
            buff.chunkRenderQueue = [];

            buff.focus = () => {
                buff.chunkRenderQueue.forEach(chunk => renderer.renderChunk(chunk));
                buff.chunkRenderQueue.splice(0, buff.chunkRenderQueue.length);
            }

            buff.blur = () => {
                // console.log('Lost focus');
            }

            renderer.Buffer.loaded[renderer.Buffer.hash(i, j)] = buff;

            return buff;
        },

        visible(clearCache = false) {
            if (renderer.Buffer.cachedVisibility && !clearCache) {
                return renderer.Buffer.cachedVisibility
            }

            let visible = Object.values(renderer.Buffer.loaded).filter((buffer) => {
                let visibleInLastDraw = buffer.visible;
                let visibleInCurrentDraw = renderer.Buffer.isVisible(buffer);

                if (visibleInCurrentDraw && !visibleInLastDraw) {
                    buffer.focus();
                }
                if (!visibleInCurrentDraw && visibleInLastDraw) {
                    buffer.blur();
                }

                return visibleInCurrentDraw;
            });

            renderer.Buffer.cachedVisibility = visible;

            return visible;
        },

        isVisible(buffer) {
            // Update the values we're going to use on this draw loop
            buffer.canvasHeight = buffer.height * renderer.ViewPort.scale;
            buffer.canvasWidth = buffer.width * renderer.ViewPort.scale;
            buffer.canvasX = buffer.i * RenderSettings.BUFFER_SIZE * renderer.ViewPort.scale + renderer.ViewPort.offsetX + renderer.ViewPort.tempOffsetX;
            buffer.canvasY = buffer.j * RenderSettings.BUFFER_SIZE * renderer.ViewPort.scale + renderer.ViewPort.offsetY + renderer.ViewPort.tempOffsetY;
            buffer.canvasRX = buffer.canvasX + buffer.canvasWidth;
            buffer.canvasRY = buffer.canvasY + buffer.canvasHeight;

            buffer.visible = (
                buffer.canvasRY > 0 &&
                0 < buffer.canvasRX &&
                buffer.canvasY < height &&
                buffer.canvasX < width
            );

            return buffer.visible;
        },

    },

    ViewPort: {
        scaleMin: 1,
        scaleMax: 5,

        scale: scl,

        offsetX: 0,
        offsetY: 0,

        tempOffsetX: 0,
        tempOffsetY: 0,

        middleBlock: [0, 0],

        zoomAnchor: [0, 0],

        // TODO: Move appropriate sections of code to this object
        overlaps(x1, y1, x2, y2) {
            // TODO
            // return (
            //     y2 > 0 &&
            //     0 < x2 &&
            //     y1 < height &&
            //     x1 < width
            // );
        },
        moveTo(worldX, worldY) {
            let target = renderer.ViewPort.worldToCanvas(worldX, worldY, true);
            renderer.ViewPort.offsetX -= (target[0] - width / 2);
            renderer.ViewPort.offsetY -= (target[1] - height / 2);
        },
        canvasToWorld(canvasX, canvasY) {
            return [
                floor(((canvasX - renderer.ViewPort.offsetX) * (1 / renderer.ViewPort.scale)) / RenderSettings.BLOCK_RESOLUTION),
                floor(((canvasY - renderer.ViewPort.offsetY) * (1 / renderer.ViewPort.scale)) / RenderSettings.BLOCK_RESOLUTION),
                getWorldY(canvasX, canvasY)
            ];
        },
        worldToCanvas(worldX, worldZ, offset = true) {
            return [
                (worldX * renderer.ViewPort.scale) + (offset ? renderer.ViewPort.offsetX + renderer.ViewPort.tempOffsetX : 0),
                (worldZ * renderer.ViewPort.scale) + (offset ? renderer.ViewPort.offsetY + renderer.ViewPort.tempOffsetY : 0)
            ];
        },
        setScale(value, moveTo = null) {
            renderer.ViewPort.scale = min(renderer.ViewPort.scaleMax, max(renderer.ViewPort.scaleMin, round(parseFloat(value), 2)));

            if (moveTo) {
                renderer.ViewPort.moveTo(moveTo[0], moveTo[1], false);
            }
        },
        setOffsetX(value) {
            renderer.ViewPort.setOffsets(value, null);
        },
        setOffsetY(value) {
            renderer.ViewPort.setOffsets(null, value);
        },
        setOffsets(x, y) {
            if (x !== null) renderer.ViewPort.offsetX = x;
            if (y !== null) renderer.ViewPort.offsetY = y;

            renderer.ViewPort.middleBlock = this.canvasToWorld(width / 2, height / 2);
        },
        resetOffsets() {
            renderer.ViewPort.setOffsets(0, 0);

            renderer.ViewPort.tempOffsetX = 0;
            renderer.ViewPort.tempOffsetY = 0;
        },
        diagnol() {
            let left = renderer.ViewPort.canvasToWorld(0, 0);
            let right = renderer.ViewPort.canvasToWorld(width, height);
            let delta = [Math.abs(right[0] - left[0]), Math.abs(right[1] - left[1])];

            return delta;
        },
        toPacket() {
            return {
                worldX: renderer.ViewPort.middleBlock[0],
                worldZ: renderer.ViewPort.middleBlock[1],
                radius: ((max(renderer.ViewPort.diagnol()) / 2) >> 8) + 1
            }
        },
    },

    mapIcons: null,

    minecraftFont: null,

    setup: () => {
        renderer.BlockPainter = new FlatColorBlockPainter();
        // renderer.BlockPainter = new TexturedBlockPainter();

        renderer.ViewPort.setOffsets(width / 2, height / 2);

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

        renderer._processChunkRenderQueue();

        renderer.Buffer.visible(true).forEach((buffer) => {
            push();

            translate(buffer.canvasX, buffer.canvasY);
            image(buffer, 0, 0, buffer.canvasWidth, buffer.canvasHeight);

            pop();
        });

        // Optional visual elements
        if (showGridOverlay) renderer.renderGridOverlay();
        if (showCoordinates) renderer.renderMouseCoordinates();
        if (showBufferOutlines) renderer.renderBufferOutlines();
        if (showAxis) renderer.renderAxis();
        if (showPlayers) renderer.drawPlayers();
        if (showCrosshair) renderer.renderCrosshair();
        if (showFps) renderer.renderFrameRateOnCanvas();
    },

    chunkRenderQueue: [],

    renderChunk: (chunk, force = false) => {
        if (!force) {
            renderer.chunkRenderQueue.push(chunk);
        } else {
            renderer._processChunkRenderQueue(chunk, force);
        }
    },

    renderChunkBatchAsync: function (chunks, preloadBuffers = true) {
        return new Promise(async (resolve, reject) => {
            try {
                if (preloadBuffers) {
                    chunks.forEach(chunk => {
                        renderer.Buffer.getFor(chunk.x << 4, chunk.z << 4, true);
                    });
                }

                renderer._processChunkRenderQueue(chunks, true);
            } catch (e) {
                reject(e);
            }

            resolve();
        });
    },

    _processChunkRenderQueue: async (chunk = null, force = false) => {
        let chunksToRender;

        if (chunk) {
            if (!(chunk instanceof Array)) {
                chunksToRender = [chunk];
            } else {
                chunksToRender = chunk;
            }
        } else {
            chunksToRender = renderer.chunkRenderQueue.splice(0, RenderSettings.CHUNK_RENDER_RATE);
        }

        for (var i = chunksToRender.length - 1; i >= 0; i--) {            
            chunk = chunksToRender.pop();

            await sleep(1);

            var buffer = renderer.Buffer.getFor(chunk.x << 4, chunk.z << 4);

            // If buffer is not visible in the viewport, don't bother rendering the chunk
            // put it the render queue, unless force is set to true
            if (!force && !renderer.Buffer.isVisible(buffer)) {
                buffer.chunkRenderQueue.push(chunk);
                return;
            }

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
                        console.error(`Outside buffer rendering on x axis detected. (Target: ${chunkBufferX + x}) (Buffer: ${buffer.i}, ${buffer.j}) (Chunk: ${chunk.x}, ${chunk.z})`);
                    }
                    if (chunkBufferZ + (z * renderer.Buffer.BLOCK_RESOLUTION) >= buffer.height) {
                        console.error(`Outside buffer rendering on y axis detected. (Target: ${chunkBufferZ + z}) (Buffer: ${buffer.i}, ${buffer.j}) (Chunk: ${chunk.x}, ${chunk.z})`);
                    }
                }
            }
        }
    },

    renderGridOverlay: () => {
        var chunkSize = RenderSettings.CHUNK_SIZE * (renderer.ViewPort.scale);
        var xOff = (renderer.ViewPort.offsetX + renderer.ViewPort.tempOffsetX) % chunkSize;
        var yOff = (renderer.ViewPort.offsetY + renderer.ViewPort.tempOffsetY) % chunkSize;
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
                buffer.i * RenderSettings.BUFFER_SIZE * renderer.ViewPort.scale + renderer.ViewPort.offsetX + renderer.ViewPort.tempOffsetX,
                buffer.j * RenderSettings.BUFFER_SIZE * renderer.ViewPort.scale + renderer.ViewPort.offsetY + renderer.ViewPort.tempOffsetY
            );

            noFill();
            stroke('green');
            strokeWeight(2);
            rect(0, 0, RenderSettings.BUFFER_SIZE * renderer.ViewPort.scale, RenderSettings.BUFFER_SIZE * renderer.ViewPort.scale);

            pop();
        });
    },

    renderAxis: () => {
        stroke('red');
        strokeWeight(1);
        line(renderer.ViewPort.offsetX + renderer.ViewPort.tempOffsetX, 0, renderer.ViewPort.offsetX + renderer.ViewPort.tempOffsetX, height);

        stroke('blue');
        strokeWeight(1);
        line(0, renderer.ViewPort.offsetY + renderer.ViewPort.tempOffsetY, width, renderer.ViewPort.offsetY + renderer.ViewPort.tempOffsetY);
    },

    renderFrameRateOnCanvas: () => {
        push();
        noStroke();
        // add little background
        fill(0, 0, 0, 130);
        rect(width / 2 - 21, 2, 42, 24);
        fill("#fff");
        textSize(16);
        textAlign(CENTER);
        text(frameRate().toFixed(1), width / 2, 20);
        pop();
    },

    drawPlayers: () => {
        noStroke();
        fill('red');
        players.forEach(player => {
            if (!player) return;

            push();
            let coords = renderer.ViewPort.worldToCanvas(player.position.x, player.position.z, true);

            // Move the origin to player pos
            translate(coords[0], coords[1]);

            if (player.position.yaw !== undefined) {
                rotate(radians(player.position.yaw - 180));
            }

            image(renderer.mapIcons, -16, -16, 32, 32, 0, 0, 16, 16);

            pop();
        });
    },

    renderCrosshair: () => {
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
        let coord = renderer.ViewPort.canvasToWorld(mouseX, mouseY);
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