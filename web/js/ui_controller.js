const UI = {

    fpsCounter: null,
    fpsTracked: [],

    debugBarContainer: null,

    consoleContainer: null,
    messageList: null,

    setup: () => {
        UI.fpsCounter = document.getElementById('fps-counter');

        UI.consoleContainer = document.getElementById('console-container');
        UI.messageList = document.getElementById('console-messages');
    },

    update: () => {
        UI.fpsTracked.push(frameRate());
        if(UI.fpsTracked.length > 60) UI.fpsTracked.shift();

        let toShow = UI.fpsTracked.reduce((acc, curr) => acc + curr) / UI.fpsTracked.length;

        UI.fpsCounter.innerHTML = "FPS: " + toShow.toFixed(1);
    },

    log: (message) => {
        let messageElement = document.createElement('li');
        messageElement.innerHTML = message;

        UI.messageList.appendChild(messageElement);
        UI.messageList.scrollTop = UI.messageList.scrollHeight;
    },

    clearConsole: () => {
        UI.messageList.innerHTML = '';
    }

}