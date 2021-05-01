const Command = require('./command.js');
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const Input = {

    closeCallback: null,

    start: (closeCallback) => {
        rl.question('', Input.processInput);

        if(closeCallback) {
            Input.closeCallback = closeCallback;
        }

        rl.on('close', Input.closeCallback);
    },

    processInput: (rawInput) => {
        
        Command._process(null, rawInput);

        Input.start();
    },

};

module.exports = Input;