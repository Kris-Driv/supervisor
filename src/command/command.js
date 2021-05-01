const logger = require("../utils/logger.js");
const Packet = require("../network/packet");
const fs = require("fs");
const { exit } = require("process");
const _NetworkEntityStorageLogic = require("../network/network_entity_storage.js");

const CommandInstances = {
    Network: {
        usage: 'network',

        execute: (ws, args) => {
            logger.info('------- Network Status -------');
            logger.info('Connections in queue: ' + Object.values(_NetworkEntityStorageLogic.connectionQueue).length);
            logger.info('Viewers connected: ' + Object.values(_NetworkEntityStorageLogic.viewers).length);
            logger.info('Servers connected: ' + Object.values(_NetworkEntityStorageLogic.servers).length);

            return true;
        },
    },
    Entities: {
        usage: 'entities',

        execute: (ws, args) => {

            console.log(Command.handler.cache.entities);

            return true;
        }
    },
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
    Cache: {
        usage: 'cache <reset|size|generate|read|write>',

        execute: (ws, args) => {
            if(args.length < 1) {
                return false;
            }

            switch(args[0]) {
                case 'reset':
                    Command.handler.cache.clearChunks();
                    logger.info('Level cache cleared');
                break;
                case 'size':
                    var pk = Command.handler.cache.cachedPacket;
                    if(!pk) {
                        logger.info('Cache packet not generated');
                        break;
                    }

                    logger.info('Cache packet size ' + humanFileSize(pk.length));
                break;
                case 'generate':
                    logger.info('Resetting cached packet and generating new one ...');
                    Command.handler.cache.cachedPacket = null;
                    var pk = Command.handler.cache.toPacket();
                    logger.info('Packet generated with size: ' + humanFileSize(pk.length));
                    break;
                case 'write':
                    if(args.length < 2) {
                        logger.info('Please enter output file name');
                        break;
                    }
                    var pk = Command.handler.cache.cachedPacket;
                    if(!pk) {
                        logger.info('Cache packet not generated');
                        break;
                    }

                    var fileOut = args[1];
                    var path = "cache/"+fileOut+".json";

                    logger.info("Writing packet to " + path + " ...");
                    fs.writeFile("cache/"+fileOut+".json", pk, function(err) {
                        if(err) {
                            logger.error("Saving cache packet failed.");
                            console.log(err);
                            return;
                        }
                        logger.info("Cache packet saved successfully!");
                    });

                    break;
                case 'read':
                    if(args.length < 2) {
                        logger.info('Enter file path');
                        break;
                    }
                    var filepath = args[1];
                    
                    if(!fs.existsSync(filepath)) {
                        logger.info(`File ${filepath} does not exist`);
                        break;
                    }

                    logger.info(`Loading cache from file ${filepath} ...`)
                    fs.readFile(filepath, 'utf8' , (err, data) => {
                      if (err) {
                        logger.error(err);
                        return;
                      }
                      Command.handler.cache.cachedPacket = data;

                      logger.info("Cache loaded");
                    });
                    break;

                default:
                    return false;
            }

            return true;
        }
    }
}

const Command = {

    supervisor: null,

    registered: {
        'cache': CommandInstances.Cache,
        'say': CommandInstances.Say,
        'stop': CommandInstances.Stop,
        'entities': CommandInstances.Entities,
        'network': CommandInstances.Network,
    },

    ...CommandInstances,

    setup: (supervisor) => {
        Command.supervisor = supervisor;
    },

    _process: (ws, rawInput) => {
        let args = rawInput.trim().split(' ');
        let command = args.shift();
        command = command.toLowerCase();

        if(command.length < 1) {
            return true;
        }

        let $command = Command.registered[command];

        if(!$command) {
            logger.info(`Command '${command}' not found. Type 'help' to list all commands`);
            return true;
        }

        // do {
        let ret = $command.execute(ws, args ?? []);
        // } while(typeof ret === 'object' && typeof ret.execute === 'function');

        if(!ret) {
            logger.info(`Usage: ${$command.usage}`);
        }
        return ret;
    }

}

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
 function humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
    return bytes.toFixed(dp) + ' ' + units[u];
  }
  

module.exports = Command;