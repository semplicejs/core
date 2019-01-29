const http = require('http');
const https = require('https');
const multipartser = require('multipartser');
const resolve = require('./response');
const routes = require('./tools/routes-array');
const WebSocket = require('./websocket');

var socket;
var token;

module.exports = class Semplice {
    constructor(type = 'http', options = {}) {
        this.typeServer = type;
        this.optionSecure = options;
        this.server;
        this.wss;
        this.socket;
        this.token = 'jbfbsdkfbasfquwbefjdsbf';
        token = this.token;
        this.eventsWS = [];
    }

    onRequest(req, res) {

        const {
            headers,
            method,
            url
        } = req;

        var body = {};
        var files = {};
        var parser;
        var boundary

        const options = {
            req: req,
            res: res,
            body: body,
            files: files,
            socket: socket,
            token: token,
            method: method
        }

        let contentType = headers && headers['content-type'];


        if (!contentType) {
            resolve(options);
        } else {
            let contentTypeParts = contentType.split(';');
            contentType = contentTypeParts[0];
            boundary = contentTypeParts[1];
            boundary = boundary.trim().split('=');
            boundary = boundary[1];

            parser = multipartser();
            parser.boundary(boundary);

            parser.on('part', function (part) {

                if (part.type == 'file') {

                    files[part.name] = {
                        name: part.name,
                        filename: part.filename,
                        contentType: part.contentType,
                        contents: part.contents,
                    }

                } else if (part.type == 'field') {

                    body[part.name] = part.value;

                }

            });

            parser.on('end', function () {
                resolve(options);
            });

            req.setEncoding('utf8');
            req.on('data', parser.data);
            req.on('end', parser.end);

            parser.on('error', function (error) {
                console.error(error);
            });
        }
    }

    setToken(tkn) {
        token = tkn;
    }

    addRoute(route) {
        routes.push(route);
    }

    addSocket(event){
        this.eventsWS.push(event);
    }

    createServer() {

        switch (this.typeServer) {
            case 'http':
                this.server = http.createServer(this.onRequest);
                break;
            case 'https':
                this.server = https.createServer(this.optionSecure, this.onRequest);
                break;
        }

        exports.ws = new WebSocket(this.server,this.eventsWS);
    }

    listen(port, callback) {
        try {
            this.createServer();
            this.server.listen(port, callback);
        } catch (error) {
            callback(error);
        }
    }
};



