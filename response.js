const urls = require('url');
const parse_query_string = require('./query_params');
const routes = require('./routes-array');
const NodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const jwt = require('jwt-simple');
const path = require('path');
const fs = require('fs');
const map = require('./mimeTypes');
const extType = type => map.find(e => e.ext === type );


module.exports = function (req,res,headers,method,url,body,files,wss,tkn){

    tkn = tkn.toString();
    url = url.split('?');
    let origin = url[0];

    

    res['json'] = data => res.write(JSON.stringify(data));
    res['status'] = data => res.statusCode = data;
    res['ws'] = data => wss == undefined || null ? 'not connection' : wss.send(data);
    res['sendEmail'] = (data,mailOptions,callback) => {
        var transport = NodeMailer.createTransport(smtpTransport(data));
        return transport.sendMail(mailOptions, callback);
    }


    res['send'] = (status,data,msg = '') => {
        res.writeHead(status, { 
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Headers':'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method',
            'Access-Control-Allow-Methods':'GET, POST, OPTIONS, PUT, DELETE',
            'Allow':'GET, POST, OPTIONS, PUT, DELETE',
            'Content-Type':'application/json',
            'X-Powered-By': 'SempliceJS'
        });
        res.statusCode = status;
        res.write(JSON.stringify(data));
        wss == undefined || null ? 'not connection' : wss.send(msg);
        res.end();
    }

    res['generateToken'] = user => {
        let payload = {
            sub:user._id,
            username:user.name
        }

        return jwt.encode(payload,tkn);
    }

    req['headers'] = headers;
    req['body'] = body;
    req['files'] = files;

    let route = routes.find(e => {

        e.method = e.method == null ? 'GET' : e.method;

        if(e.path === origin && e.method.toLowerCase() === method.toLowerCase()){
            var query_string = url[1] == undefined || null ? '' : url[1];
            var parsed_qs = parse_query_string(query_string);
            req['params'] = parsed_qs;
            return e;
        } 
        
    });
    
    let msgError = 'Route api not found'

    if(route == undefined || route == null){
        const sanitizePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
        let pathname = path.join(path.resolve(),sanitizePath);
          
          let ext = path.parse(pathname).ext.split('.')[1];
          let objExt = extType(ext) == null ? {ext:null,content:null} : extType(ext);
          let regexExt = "\." + objExt.ext + "$";

        if(req.url.match(regexExt)){    
            var imagePath = path.join(path.resolve(), 'public', req.url);
            fs.exists(imagePath, function (exist) {
                if(exist){
                    var fileStream = fs.createReadStream(imagePath);
                    res.writeHead(200, {"Content-Type":objExt.content});
                    fileStream.pipe(res);
                } else {
                    res.send(500,{Error:msgError});        
                }
            })
            
        } else {
            res.send(500,{Error:msgError});
        }
    } else {
        if(route.auth){
            
            if (!req.headers.authorization) {
                return res.send(403,{Error: 'Authentication Error'});
            }

            var tokens = req.headers.authorization.split(" ")[1];
            var payload = jwt.decode(tokens,tkn);
            req['user'] = payload.sub;

            route.controller(req,res);

        } else {

            route.controller(req,res);           

        }
        
    }
}
