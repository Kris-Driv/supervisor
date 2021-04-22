const chalk = require("chalk");

function twoChar(text) {
    return (text + '').padStart(2, "0");
}

function getTime() {
    return twoChar((new Date()).getHours()) + ":" + twoChar((new Date()).getMinutes()) + ":" + twoChar((new Date()).getSeconds());
}

const logger = {
    _log: (text, prefix, color) => {
        console.log(`${chalk.cyan(getTime())} ${color(`[${prefix}]: ${text}`)}`);
    },
      
    info: (text) => {
        logger._log(text, "INFO", chalk.white);
    },

    notice: (text) => {
        logger._log(text, "NOTICE", chalk.magenta);
    },

    error: (text) => {
        logger._log(text, "RED", chalk.red);
    }
}

module.exports = logger;