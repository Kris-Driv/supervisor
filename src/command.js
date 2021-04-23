const logger = require("./logger");
const Packet = require("./packet");
const { exit } = require("process");

const CommandInstances = {
    Say: {
        usage: 'say <...message>',

        execute: (ws, args) => {
            if(args.length < 1) {
                return false;
            }

            let message = args.join(' ');
            let pk = Packet.Message.encode(message);
            Command.handler._broadcast(pk);

            logger.info(`[Server]: ${message}`);
            
            return true;
        }
    },
    Stop: {
        usage: 'stop',

        execute: (ws, args) => {
            exit();
            
            return true;
        }
    },
}

const Command = {

    handler: null,

    registered: {
        'say': CommandInstances.Say,
        'stop': CommandInstances.Stop
    },

    ...CommandInstances,

    _process: (ws, rawInput) => {
        let args = rawInput.trim().split(' ');
        let command = args.shift();
        command = command.toLowerCase();

        let $command = Command.registered[command];

        if(!$command) {
            logger.info(`Command '${command}' not found. Type 'help' to list all commands`);
            return true;
        }

        let ret = $command.execute(ws, args ?? []);

        if(!ret) {
            logger.info(`Usage: ${$command.usage}`);
        }
        return ret;
    }

}

module.exports = Command;