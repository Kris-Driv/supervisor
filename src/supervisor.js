// Network
const Handler = require("./network/handler");
const Packet = require("./network/packet");
const MinecraftServer = require('./network/entity/minecraft_server.js');
const ViewerClient = require('./network/entity/viewer_client.js');
const _NetworkEntityStorageLogic = require("./network/network_entity_storage.js");
const _LevelCacheStorageLogic = require("./level/level_storage.js");

// Input
const Input = require("./command/input");
const Command = require("./command/command.js");

// Controllers
const LevelController = require("./controller/level_controller");
const AuthController = require("./controller/auth_controller");

// Utils
const logger = require("./utils/logger");
const ChunkController = require("./controller/chunk_controller");
const EntityController = require("./controller/entity_controller");
const PlayerController = require("./controller/player_controller");
const { exit } = require('process');
const ViewerController = require("./controller/viewer_controller");


// This is just a namespace
const Supervisor = {

    socket: null,

    // Global Imports
    Handler: null,
    Packet: null,
    Input: null,
    Command: null,

    // TODO
    config: null,

    // WebSocket Server Instance
    wss: null,

    ..._NetworkEntityStorageLogic,
    ..._LevelCacheStorageLogic,

    // Controllers
    controllers: [
        LevelController, AuthController, ChunkController, EntityController, PlayerController, ViewerController
    ],

    _setup: (socket, config) => {
        Supervisor.socket = socket;
        Supervisor.config = config;

        Supervisor.Handler = Handler;
        Supervisor.Input = Input;
        Supervisor.Packet = Packet;
        Supervisor.Command = Command;

        Supervisor._networkLogic();
        Supervisor._controllers();
        Supervisor._caches();
        Supervisor._input();

        Supervisor._infoPacketTask();

        logger.info('Ready to serve');
    },

    _stop: () => {
        Object.values(_LevelCacheStorageLogic.levels).forEach(cache => {
            _LevelCacheStorageLogic.saveCache(cache);
        });

        logger.info('Server stopped.');

        exit();
    },

    /**
     * Attaches listeners to WebSocket server
     */
    _networkLogic: () => {
        /*
         * Network flow
         */
        Supervisor.socket.on('connection', (ws) => {
            /*
             * On initial connection, put the newly created socket into array and wait for incoming login packet 
             */
            Supervisor.addToConnectionQueue(ws);

            logger.info('Incoming connection, waiting for login packet.');

            /*
             * Schedule timeout callback function in case the login packet does not arrive in next five seconds
             */
            setTimeout((socket) => {
                if (Supervisor.removeFromConnectionQueue(socket)) {
                    logger.notice(`Connection expired, didn't recieve login packet in time`);
                    socket.close();
                }
            }, 5000, ws);

            /**
             * Route the incoming packets to handler
             */
            ws.on('message', (data) => {
                if (!Supervisor.Handler._process(data, ws)) {
                    logger.error('handling error detected');
                }
            });

            /**
             * Handle socket closed event
             */
            ws.on('close', () => {
                let ne = Supervisor.getNetworkEntity(ws);

                if (ne) {
                    if (ne instanceof MinecraftServer) {
                        logger.info('Connection with minecraft server was closed');
                    } else if (ne instanceof ViewerClient) {
                        logger.info('Connection with viewer client was closed');
                    } else {
                        logger.info('Connection with unspecified network entity was closed');
                    }

                    Supervisor.removeNetworkEntity(ws);
                } else {
                    logger.notice('Unauthorized connection closed.');

                    Supervisor.removeFromConnectionQueue(ws);
                }
            });

        });
    },

    /**
     * Initializes Controllers that acts upon incoming packets
     */
    _controllers: () => {
        Supervisor.controllers.forEach(controller => {
            controller._boot(Supervisor);
            controller.setup();
        });
    },

    /**
     * Initializes the memory storage objects for chunks and entities
     */
    _caches: () => {
        Supervisor.loadCache('test', true);
    },

    /**
     * Initialize the console inputs
     */
    _input: () => {
        Supervisor.Input.start(() => {
            Supervisor._stop();
        });
        Supervisor.Command.setup(Supervisor);
    },

    _infoPacketTask: () => {
        setTimeout(() => {
            let server = _NetworkEntityStorageLogic.servers[0] ?? null;
            let viewers = _NetworkEntityStorageLogic.viewers;

            Supervisor.Handler._broadcast(
                Packet.InfoPacket.encode(
                    server ? server.name : undefined, 
                    server ? server.ip : undefined, 
                    server ? server.port : undefined, 
                    server ? server.levels : undefined, 
                    Object.values(viewers).length),

                viewers
            );

            // Supervisor.Handler._broadcast(
            //     Packet.InfoPacket.encode(undefined, undefined, undefined, undefined, Object.values(viewers).length),

            //     _NetworkEntityStorageLogic.servers
            // );

            Supervisor._infoPacketTask();
        }, 5000);
    },

}

module.exports = Supervisor;