const WebSocket = require('ws');

class WSS {
    constructor(server, events = []) {
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

        this.wss.on('connection', function (ws, require) {
            ws.on('message', function (message) {
                message = JSON.parse(message);
                self.events.forEach(event => {
                    if (message.data.event == event.name) {

                        let io = {
                            send: (ev, data = {}) => {
                                data.event = ev;
                                return ws.send(JSON.stringify(data));
                            },

                            getIp: () => require.connection.remoteAddress,

                            // forwardedFor: () => require.headers['x-forwarded-for'].split(/\s*,\s*/)[0],

                            // getRequest: () => require,
                            
                            getHeaders: () => require.headers,

                            getCookies: () => require.headers.cookie,

                            getCookie: (name) => {
                                var i, x, y, cookies = require.headers.cookie.split(";");

                                for (i = 0; i < cookies.length; i++) {
                                    x = cookies[i].substr(0, cookies[i].indexOf("="));
                                    y = cookies[i].substr(cookies[i].indexOf("=") + 1);
                                    x = x.replace(/^\s+|\s+$/g, "");
                                    if (x == name) {
                                        return unescape(y);
                                    }
                                }
                            },
                        }

                        event.controller(io, message.data);
                    }
                })
            });

            ws.send(JSON.stringify({
                event: 'OPEN_CONEXION'
            }));
        });
    }

    send(data) {
        this.wss.on('connection', function open(ws) {
            ws.send(JSON.stringify(data));
        });
    }
}


module.exports = WSS;