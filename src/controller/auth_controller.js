const event = require("../event/event");
const Packet = require("../network/packet");
const logger = require("../utils/logger");

const AuthController = {

    supervisor: null,
    
    _boot(supervisor) {
        AuthController.supervisor = supervisor;
    },

    setup: () => {
        Packet.ViewerLogin.listeners.push(AuthController.handleViewerLogin);
        Packet.ServerLogin.listeners.push(AuthController.handleServerLogin);
    },

    handleViewerLogin: (pk, ws) => {
        let ne = AuthController.supervisor.getNetworkEntity(ws);

        if(ne) {
            logger.info('Received login packet from authenticated network entity (viewer), closing connection.');
            ne.close('Already logged in');
            return true;
        }

        ne = AuthController.supervisor.createViewerEntity(ws);
        if(!ne.handleLoginPacket(pk)) {
            return;
        }

        // Send back the packet notifying that connection was successful!
        ne.send(Packet.ViewerLogin.encode());


        logger.info('Viewer connected');

        // Fire event
        event.EventEmitter.emit(event.VIEWER_LOGGED_IN, ne);

        return true;
    },

    handleServerLogin: (pk, ws) => {
        let ne = AuthController.supervisor.getNetworkEntity(ws);

        if(ne) {
            logger.info('Received login packet from authenticated network entity (server), closing connection.');
            ne.close('Already logged in');
            return true;
        }

        ne = AuthController.supervisor.createServerEntity(ws);
        if(!ne.handleLoginPacket(pk)) {
            return;
        }

        // Send back the packet notifying that connection was successful!
        ne.send(Packet.ServerLogin.encode());

        logger.info('Server connected');
        
        // Fire event
        event.EventEmitter.emit(event.SERVER_LOGGED_IN, ne);

        return true;
    },

};

module.exports = AuthController;