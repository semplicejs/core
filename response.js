const urls = require('url');
const parse_query_string = require('./tools/query_params');
const path = require('path');
const fs = require('fs');
const map = require('./tools/mimeTypes');
const tools = require('./tools/tools');
const router = require('./router');
const extType = type => map.find(e => e.ext === type);
const Semplice = require('./semplice');

module.exports = function (obj) {
    exports.tkn = obj.token.toString();

    url = obj.req.url.split('?');
    let origin = url[0];

    obj.res['json'] = data => obj.res.write(JSON.stringify(data));
    obj.res['status'] = data => obj.res.statusCode = data;
    obj.res['socket'] = (event = '',data = {}) => {
        data['event'] = event;
        Semplice.ws.send(data);
    };
    obj.res['send'] = (status, data, msg = '') => {

        obj.res.writeHead(status, headersBasic());
        obj.res.write(JSON.stringify(data));

        if(typeof msg === 'string'){
            Semplice.ws.send({event:msg});
        } else if(typeof msg === 'object'){
            Semplice.ws.send(msg);
        }

        obj.res.end();
    }

    obj.req['headers'] = obj.req.headers;
    obj.req['body'] = obj.body;
    obj.req['files'] = obj.files;

    obj['origin'] = origin;
    obj['token'] = obj.token.toString();

    router(obj, function(route){
        route = route.obj;
        let msgError = 'Route api not found'

        obj.req['params'] = route.params;
        obj.req['queryParams'] = query(url[1]);

        if (route == undefined || route == null) {
            const sanitizePath = path.normalize(obj.req.url).replace(/^(\.\.[\/\\])+/, '');
            let pathname = path.join(path.resolve(), sanitizePath);

            let ext = path.parse(pathname).ext.split('.')[1];
            let objExt = extType(ext) == null ? {
                ext: null,
                content: null
            } : extType(ext);
            let regexExt = "\." + objExt.ext + "$";

            if (obj.req.url.match(regexExt)) {
                var imagePath = path.join(path.resolve(), 'public', obj.req.url);
                fs.exists(imagePath, function (exist) {
                    if (exist) {
                        var fileStream = fs.createReadStream(imagePath);
                        obj.res.writeHead(200, {
                            "Content-Type": objExt.content
                        });
                        fileStream.pipe(obj.res);
                    } else {
                        obj.res.send(404, {
                            Error: msgError
                        });
                    }
                })

            } else {
                obj.res.send(400, {
                    Error: msgError
                });
            }
        } else {
            if (route.auth) {

                if (!obj.req.headers.authorization) {
                    return obj.res.send(403, {
                        Error: 'Authentication Error'
                    });
                }

                var tokens = obj.req.headers.authorization.split(" ")[1];
                var payload = jwt.decode(tokens, obj.token);
                obj.req['user'] = payload.sub;

                route.controller(obj.req, obj.res, tools);

            } else {

                route.controller(obj.req,obj.res, tools);

            }

        }


    });
}


function query(url) {
    var query_string = url == undefined || null ? '' : url;
    var parsed_qs = parse_query_string(query_string);
    return parsed_qs;
}

function headersBasic() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Allow': 'GET, POST, OPTIONS, PUT, DELETE',
        'Content-Type': 'application/json',
        'X-Powered-By': 'SempliceJS'
    }
}