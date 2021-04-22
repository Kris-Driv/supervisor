const chalk = require("chalk");

function twoChar(text) {
    return (text + '').padStart(2, "0");
}

function getTime() {
    return twoChar((new Date()).getHours()) + ":" + twoChar((new Date()).getMinutes()) + ":" + twoChar((new Date()).getSeconds());
}

module.exports = {
    info: (text) => {
        console.log(chalk.cyan(getTime() + " ") + chalk.yellow("[INFO]: " + text));
    },

    notice: (text) => {
        console.log(chalk.cyan(getTime() + " ") + chalk.magenta("[NOTICE]: " + text));
    },

    error: (text) => {
        console.log(chalk.cyan(getTime() + " ") + chalk.red("[ERROR]: " + text));
    }
}