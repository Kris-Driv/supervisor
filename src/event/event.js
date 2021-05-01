const events = require('events');

const EventEmitter = new events.EventEmitter();

module.exports = {
    // Event names
    VIEWER_LOGGED_IN: 'viewer.login',
    SERVER_LOGGED_IN: 'server.login',

    EventEmitter
};