const Command = require('./command.js');
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const Input = {

    start: (closeCallback) => {
        rl.question('', Input.processInput);

        rl.on('close', closeCallback);
    },

    processInput: (rawInput) => {
        
        Command._process(null, rawInput);

        Input.start();
    },

};

module.exports = Input;