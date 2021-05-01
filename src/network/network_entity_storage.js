const ViewerClient = require('./entity/viewer_client.js');
const MinecraftServer = require('./entity/minecraft_server.js');

require('../utils/object_id.js');

const _NetworkEntityStorageLogic = {

    // Network Entities
    connectionQueue: [],

    viewers: [],
    servers: [],

    getNetworkEntity(socket) {
        let key = Object.id(socket);

        return _NetworkEntityStorageLogic.viewers[key] ?? (_NetworkEntityStorageLogic.servers[key] ?? null);
    },

    addToConnectionQueue(socket) {
        _NetworkEntityStorageLogic.connectionQueue[Object.id(socket)] = socket;
    },

    removeFromConnectionQueue(socket) {
        let index = _NetworkEntityStorageLogic.connectionQueue.indexOf(socket);

        if(index < 0) {
            return false;
        }
    
        _NetworkEntityStorageLogic.connectionQueue.splice(index, 1);

        return true;
    },

    createViewerEntity(socket) {
        let entity = new ViewerClient(socket);

        _NetworkEntityStorageLogic.viewers[Object.id(socket)] = entity;
        _NetworkEntityStorageLogic.removeFromConnectionQueue(socket);

        return entity;
    },

    createServerEntity(socket) {
        let entity = new MinecraftServer(socket);

        _NetworkEntityStorageLogic.servers[Object.id(socket)] = entity;
        _NetworkEntityStorageLogic.removeFromConnectionQueue(socket);

        return entity;
    },

    removeNetworkEntity(socket) {
        let entity = _NetworkEntityStorageLogic.getNetworkEntity(socket);

        if(!entity) {
            throw 'Invalid socket passed to storage logic, can not remove unlisted socket object';
        }

        if(entity instanceof ViewerClient) {
            _NetworkEntityStorageLogic.viewers.splice(_NetworkEntityStorageLogic.servers.indexOf(entity), 1);
        } else if (entity instanceof MinecraftServer) {
            _NetworkEntityStorageLogic.servers.splice(_NetworkEntityStorageLogic.servers.indexOf(entity), 1);
        } else {
            throw 'Invalid socket passed to storage logic, can not remove base NetworkEntity class which is not extended by ViewerClient or MinecraftServer';
        }

        return true;
    },

};

module.exports = _NetworkEntityStorageLogic;