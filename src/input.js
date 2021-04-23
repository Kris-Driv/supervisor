const Command = require('./command.js');
const readline = require("readline");
const { exit } = require('process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const Input = {

    start: () => {
        rl.question('', Input.processInput);

        rl.on('close', () => exit());
    },

    processInput: (rawInput) => {
        
        Command._process(null, rawInput);

        Input.start();
    },

};

module.exports = Input;