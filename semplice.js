const http = require('http');
const multipartser = require( 'multipartser' );
const resolve = require('./response');
const routes = require('./routes-array');
const WebSocket = require('ws');


var socket;
var token;

module.exports = class Semplice {
    constructor(){
        this.server;
        this.wss;
        this.socket;
        this.token = 'jbfbsdkfbasfquwbefjdsbf';
        token = this.token;
    }

    onRequest(req,res){
        const self = this;
        
        const { headers, method, url } = req;

        var body = {};
        var files = {};
        var parser;
        var boundary

        let contentType = headers && headers[ 'content-type' ];
        

        if ( ! contentType ) {
            resolve(req,res,headers,method,url,body,files,socket,token);
        } else {
            let contentTypeParts = contentType.split( ';' );

            if ( contentTypeParts.length != 2 ) {
                resolve(req,res,headers,method,url,body,files,socket,token);
            }

            contentType = contentTypeParts[ 0 ];
    
            if ( contentType != 'multipart/form-data' ) {
                resolve(req,res,headers,method,url,body,files,socket,token);
            }

            boundary = contentTypeParts[ 1 ];
            boundary = boundary.trim().split( '=' );
        
            if ( boundary.length != 2 ) {
                resolve(req,res,headers,method,url,body,files,socket,token);
            }
        
            boundary = boundary[ 1 ];

            parser = multipartser(); 
            parser.boundary( boundary );

            parser.on( 'part', function ( part ) {
                
                if ( part.type == 'file' ) {

                    files[part.name] = {
                        name:part.name,
                        filename:part.filename,
                        contentType:part.contentType,
                        contents:part.contents,
                    }
            
                } else if ( part.type == 'field' ) {

                    body[part.name] = part.value;
            
                } 
            
            });

            parser.on( 'end', function () {
                resolve(req,res,headers,method,url,body,files,socket,token);
            });

            req.setEncoding( 'utf8' );
            req.on( 'data', parser.data );
            req.on( 'end', parser.end );
    
            parser.on( 'error', function ( error ) {
                console.error( error );
            });        
        }        
    }

    setToken(tkn){
        token = tkn;
    }

    addRoute(route){
        routes.push(route);
    }

    createServer(){
        var self = this;
        this.server = http.createServer(this.onRequest);
        var server = this.server;
        const wss = new WebSocket.Server({ server });
 
        wss.on('connection', function connection(ws) {
            ws.on('message', function incoming(message) {
                console.log('received: %s', message);
            });
            socket = ws;
        });
    }

    listen(port,callback){
        try {            
            this.createServer();
            this.server.listen(port,callback);
        } catch (error) {
            callback(error);
        }
    }

    tokenRandom(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

