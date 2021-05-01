const Packet = require("../packet");

class NetworkEntity {

    constructor(socket) {
        this.socket = socket;
    }

    send(packet) {
        this.socket.send(packet);
    }

    close(reason = null) {
        if(reason) {
            this.socket.send(Packet.Close.encode(reason));
        }
        this.socket.close();
    }

}

module.exports = NetworkEntity;