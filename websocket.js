const WebSocket = require('ws');

class WSS {
    constructor(server,events = []) {
        this.events = events;
        this.ws = null;
        this.wss = new WebSocket.Server({
            server: server,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                clientNoContextTakeover: true,
                serverNoContextTakeover: true,
                serverMaxWindowBits: 10,
                concurrencyLimit: 10,
                threshold: 1024
            }
        });

        var self = this;

        this.wss.on('connection', function(ws) {
            ws.on('message', function(message) {
                message = JSON.parse(message);
                self.events.forEach(event => {
                    if(message.data.event == event.name){
                        ws['send'] = data => ws.send(JSON.stringify(data));
                        event.controller(ws,message.data);
                    }
                })
            });

            ws.send(JSON.stringify({event:'OPEN_CONEXION'}));
        });
    }

    send(data){
        this.wss.on('connection', function open(ws) {           
            ws.send(JSON.stringify(data));
        });
    }
}


module.exports = WSS;