const WebSocket = require('ws');
const tools = require('./tools/tools');

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
        var clients = [];

        function getUniqueID() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + '-' + s4();
        };
        
        this.wss.on('connection', function (ws, require) {

            ws.id = getUniqueID();
            clients.push(ws);

            var io = {
                send: (ev, data = {}) => {
                    data.event = ev;
                    return ws.send(JSON.stringify(data));
                },

                sendAllClients: (ev,data) => clients.map(client => {
                    data['event'] = ev;
                    client.send(JSON.stringify(data));
                }),

                getId: () => ws.id,

                getClients: () => clients,

                getIp: () => require.connection.remoteAddress,

                getForwardedFor: () => equire.headers['x-forwarded-for'].split(/\s*,\s*/)[0] ? equire.headers['x-forwarded-for'].split(/\s*,\s*/)[0] : '',
                
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
                }
            }

            ws.on('message', function (message) {
                message = JSON.parse(message);
                self.events.forEach(event => {
            
                    if(message.data.event === 'OPEN_SUCCESS'){
                        
                        clients.find(e => {

                            if(e.id === message.data.socketID){

                                ws.send(JSON.stringify({
                                    event:'SUCCESS_CONECTION'
                                }))
                            }

                        })
                        
                    } else if (message.data.event == event.name) {

                        event.controller(io, message.data,tools);

                    }
                })
            });


            ws.send(JSON.stringify({
                event: 'OPEN_CONEXION',
                id: ws.id,
                status:true,
                message:'success'
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