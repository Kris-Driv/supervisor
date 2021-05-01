const chalk = require("chalk");

function twoChar(text) {
    return (text + '').padStart(2, "0");
}

function getTime() {
    return twoChar((new Date()).getHours()) + ":" + twoChar((new Date()).getMinutes()) + ":" + twoChar((new Date()).getSeconds());
}

const logger = {
    debugLevel: 0,

    _log: (text, prefix, color) => {
        console.log(`${chalk.cyan(getTime())} ${color(`[${prefix}]: ${text}`)}`);
    },

    debug: (text) => {
        if(logger.debugLevel > 0) {
            logger._log(text, "DEBUG", chalk.gray);
        }
    },
      
    info: (text) => {
        logger._log(text, "INFO", chalk.white);
    },

    notice: (text) => {
        logger._log(text, "NOTICE", chalk.magenta);
    },

    warning: (text) => {
        logger._log(text, "WARNING", chalk.yellow);
    },

    error: (text) => {
        logger._log(text, "ERROR", chalk.red);
    }
}

module.exports = logger;