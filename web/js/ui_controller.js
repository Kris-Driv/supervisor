let zoomPath = [];

const UI = {

    fpsTracked: [],

    debugBarContainer: null,

    consoleContainer: null,
    messageList: null,
    addressInput: null,

    setup: () => {

        UI.consoleContainer = document.getElementById('console-container');
        UI.messageList = document.getElementById('console-messages');
        UI.addressInput = document.getElementById('connection-input');

        // Statistic Elements
        UI.statsFpsValue = document.getElementById('stats-fps-value');
        UI.statsPlayersCount = document.getElementById('stats-players-value');
        UI.statsEntitiesCount = document.getElementById('stats-entities-value');
        UI.statsChunksCount = document.getElementById('stats-chunks-value');
        UI.statsViewersCount = document.getElementById('stats-viewers-count');
        UI.statsBuffersCount = document.getElementById('stats-buffers-value');
        UI.statsBuffersRendered = document.getElementById('stats-buffers-rendered-value');

        // Settings Elements
        UI.renderBufferOutlines = document.getElementById("render-buffer-outlines");
        UI.renderAxisLines = document.getElementById("render-axis-lines");
        UI.renderPlayerMarkers = document.getElementById("render-player-markers");
        UI.renderChunkGrid = document.getElementById("render-chunk-grid");
        UI.renderMouseTooltip = document.getElementById("render-mouse-tooltip");
        UI.renderCrosshair = document.getElementById("render-crosshair");


        UI.renderBufferOutlines.checked = showBufferOutlines;
        UI.renderAxisLines.checked = showAxis;
        UI.renderPlayerMarkers.checked = showPlayers;
        UI.renderChunkGrid.checked = showGridOverlay;
        UI.renderMouseTooltip.checked = showCoordinates;
        UI.renderCrosshair.checked = showCrosshair;

        UI.renderBufferOutlines.addEventListener("click", (event) => {
            showBufferOutlines = event.target.checked;
        });
        UI.renderAxisLines.addEventListener("click", (event) => {
            showAxis = event.target.checked;
        })
        UI.renderPlayerMarkers.addEventListener("click", (event) => {
            showPlayers = event.target.checked;
        });
        UI.renderChunkGrid.addEventListener("click", (event) => {
            showGridOverlay = event.target.checked;
        });
        UI.renderMouseTooltip.addEventListener("click", (event) => {
            showCoordinates = event.target.checked;
        });
        UI.renderCrosshair.addEventListener("click", (event) => {
            showCrosshair = event.target.checked;
        });

        UI.xOffsetInput = document.getElementById("x-offset-input");
        UI.zOffsetInput = document.getElementById("z-offset-input");
        UI.scaleInput = document.getElementById("scale-input");

        UI.xOffsetInput.addEventListener("change", (event) => {
            renderer.ViewPort.setOffsetX(parseFloat(event.target.value));
        });
        UI.zOffsetInput.addEventListener("change", (event) => {
            renderer.ViewPort.setOffsetY(parseFloat(event.target.value));
        });
        UI.scaleInput.addEventListener("change", (event) => {
            renderer.ViewPort.setScale(parseFloat(event.target.value));
        });

        let address = UI.addressInput.value;

        connectPocketCore(address, () => {
            document.getElementById('connection-light').classList.remove('disconnected-light');
            document.getElementById('connection-light').classList.add('connected-light');
        }, () => {
            document.getElementById('connection-light').classList.remove('connected-light');
            document.getElementById('connection-light').classList.add('disconnected-light');
        })
    },

    prevOffsetX: null,
    prevOffsetZ: null,
    prevScale: null,

    update: () => {
        UI.fpsTracked.push(frameRate());
        if (UI.fpsTracked.length > 60) UI.fpsTracked.shift();


        if (frameCount % 20 === 0) {
            let toShow = UI.fpsTracked.reduce((acc, curr) => acc + curr) / UI.fpsTracked.length;
            UI.statsFpsValue.innerHTML = toShow.toFixed(1);
            UI.statsPlayersCount.innerHTML = players.length;
            UI.statsEntitiesCount.innerHTML = entities.length;
            UI.statsChunksCount.innerHTML = chunks.length;
            UI.statsBuffersCount.innerHTML = Object.values(renderer.Buffer.loaded).length;
            UI.statsBuffersRendered.innerHTML = renderer.Buffer.cachedVisibility.length;
            UI.statsViewersCount.innerHTML = 1; // TODO

            if(renderer.ViewPort.offsetX !== UI.prevOffsetX) {
                UI.xOffsetInput.value = renderer.ViewPort.offsetX;
                UI.prevOffsetX = renderer.ViewPort.offsetX;
            }
            if(renderer.ViewPort.offsetY !== UI.prevOffsetZ) {
                UI.zOffsetInput.value = renderer.ViewPort.offsetY;
                UI.prevOffsetZ = renderer.ViewPort.offsetY;
            }
            if(renderer.ViewPort.scale !== UI.prevScale) {
                UI.scaleInput.value = renderer.ViewPort.scale;
                UI.prevScale = renderer.ViewPort.scale;
            }
        }

        // Player hover
        let hovering = [];
        players.forEach(player => {
            let coord = renderer.ViewPort.worldToCanvas(player.position.x, player.position.z, true);

            fill('blue');
            ellipse(coord[0], coord[1], 6, 6);

            if (dist(mouseX, mouseY, coord[0], coord[1]) < 18) hovering.push(player);
        });

        if (hovering.length > 0) {
            afterRender.push(() => {
                UI.renderPlayerCard(mouseX, mouseY, hovering);
            });
        }

        UI.handleMovement();
    },

    log: (message) => {
        let messageElement = document.createElement('p');
        messageElement.classList.add('message-list__message');
        messageElement.classList.add('transition-all');
        messageElement.innerHTML = message;

        setTimeout(() => {
            messageElement.classList.add('opacity-0');
        }, 1000 * 5); // 5 seconds?

        UI.messageList.appendChild(messageElement);
        UI.messageList.scrollTop = UI.messageList.scrollHeight;
    },

    clearConsole: () => {
        UI.messageList.innerHTML = '';
    },

    renderPlayerCard: (x, y, players) => {
        let faceSize = 36;
        let padding = 8;
        let containerHeight = (faceSize + padding * 2);
        let count = players.length;

        players.forEach((player, i) => {

            let name = player.name ?? 'UNKNOWN';

            push();
            // Configure
            // y - (18 + containerHeight)
            translate(x + 18, y - (containerHeight + (18 - (i > 0 ? 10 : 0))) * i - containerHeight - 18);

            // Configure Text settings
            textAlign(LEFT);
            textSize(12);

            // Container Box
            stroke('#a1a1a1');
            fill('#121212');
            rect(0, 0, containerHeight + textWidth(name) + padding, faceSize + padding * 2);

            // Cool little arrow
            if (count === 1) {
                stroke('#a1a1a1');
                strokeWeight(2);
                line(-4, containerHeight - 4, -4, containerHeight + 4);
                line(-4, containerHeight + 4, 4, containerHeight + 4);
            }

            // Name
            strokeWeight(1);
            fill('#fff');
            text(name, faceSize + padding * 2, textSize() + padding);

            // Avatar
            noStroke();
            fill('pink');
            rect(padding, padding, faceSize, faceSize);

            if (player.face) {
                player.face.render(padding, padding, faceSize, faceSize);
            }

            pop();
        });
    },

    capScale: (value) => {
        return max(0.5, min(value, 5))
    },

    controlZoom: (event) => {
        let zoom = event.deltaY / 100;

        let before =  renderer.ViewPort.canvasToWorld(width / 2, height / 2);

        let prevScl = renderer.ViewPort.scale;
        let newScl = prevScl + zoom;

        renderer.ViewPort.setScale(newScl);
        let after =  renderer.ViewPort.canvasToWorld(width / 2, height / 2);

        let deltaX = before[0] - after[0];
        let deltaY = before[1] - after[1];

        // Let's get this delta to canvas coordinates
        let deltaCanvasX = deltaX * 2;
        let deltaCanvasY = deltaY * 2;

        renderer.ViewPort.offsetX -= deltaCanvasX / 2;
        renderer.ViewPort.offsetY -= deltaCanvasY / 2;



        let old = renderer.ViewPort.worldToCanvas(before[0], before[1], true);
        zoomPath.push(old);

        event.preventDefault();

        if (zoomPath.length > 20) zoomPath.shift();

        if (!showZoomPath) return;
        afterRender.push(() => {
            stroke('#fff');
            for (var i = zoomPath.length - 1; i >= 0; i--) {
                let last = zoomPath[i + 1];
                if (!last) continue;
                let curr = zoomPath[i];

                line(last[0], last[1], curr[0], curr[1]);
            }
        });
    },


    mouseDragged: () => {
        if(!anchor) return;

        if ((mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0) === false) {
            UI.mouseReleased();
            return;
        }

        let currentPos = new p5.Vector(mouseX, mouseY);
        let d = currentPos.sub(anchor);

        renderer.ViewPort.tempOffsetX = d.x;//(d.x * renderer.ViewPort.scale);
        renderer.ViewPort.tempOffsetY = d.y;//(d.y * renderer.ViewPort.scale);
    },

    clickThroughElements: ['interface-overlay', 'console-messages'],

    mousePressed: (event) => {
        if(UI.clickThroughElements.indexOf(event.target.id) < 0) return;

        anchor = new p5.Vector(mouseX, mouseY);
    },

    mouseReleased: () => {
        anchor = null;

        renderer.ViewPort.setOffsets(
            renderer.ViewPort.offsetX + renderer.ViewPort.tempOffsetX,
            renderer.ViewPort.offsetY + renderer.ViewPort.tempOffsetY
        );

        renderer.ViewPort.tempOffsetX = 0;
        renderer.ViewPort.tempOffsetY = 0;
    },

    keyPressed: () => {
        if (keyCode === 32) {
            showGridOverlay = !showGridOverlay;
        }
    },

    moveSpeed: 10,

    handleMovement: () => {
        if(keyIsDown(BACKSPACE)) {
            renderer.ViewPort.resetOffsets();
        }
        if(keyIsDown(RIGHT_ARROW)) {
            renderer.ViewPort.setOffsetX(renderer.ViewPort.offsetX - 10 * renderer.ViewPort.scale);
        }
        if(keyIsDown(UP_ARROW)) {
            renderer.ViewPort.setOffsetY(renderer.ViewPort.offsetY + 10 * renderer.ViewPort.scale);
        }
        if(keyIsDown(DOWN_ARROW)) {
            renderer.ViewPort.setOffsetY(renderer.ViewPort.offsetY - 10 * renderer.ViewPort.scale);
        }
        if(keyIsDown(LEFT_ARROW)) {
            renderer.ViewPort.setOffsetX(renderer.ViewPort.offsetX + 10 * renderer.ViewPort.scale);
        }
        // Press Z to Zoom In
        if(keyIsDown(90)) {
            renderer.ViewPort.setScale(renderer.ViewPort.scale += 0.1, renderer.ViewPort.middleBlock);
        }
        // Press X to Zoom Out
        if(keyIsDown(88)) {
            renderer.ViewPort.setScale(renderer.ViewPort.scale -= 0.1, renderer.ViewPort.middleBlock);
        }
    }

}

window.onbeforeunload = function (e) {
    // Cache the AlpineJS component states for smooth reloads
    document.querySelectorAll('[x-data]').forEach(el => {
        let componentState = el.__x.getUnobservedData();

        for (const [key, value] of Object.entries(componentState)) {
            Cookies.set(key, value);
        }
    });
};