const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const Input = {

    start: () => {
        rl.question('', Input.processInput);
    },

    processInput: (rawInput) => {
        console.log(rawInput);

        Input.start();
    },

};

module.exports = Input;