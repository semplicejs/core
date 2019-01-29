const routes = require('./tools/routes-array');

module.exports = function router(obj,cb){
    var arr = [];
    var params = {};
    var validParams = false;
    
    routes.find(e => {
        if(/:/.test(e.path)){
            let match = e.path.split(':');
            let urlParse;

            if(match[0].length !== 1){
                urlParse = match[0][match[0].length - 1] === '/' ? match[0].slice(0,match[0].length - 1) : match[0];
            } else {
                urlParse = match[0];
            }

            let exp = '^'+urlParse+'';
            let regex = new RegExp(exp,'g');
            
            if(obj.req.url.match(regex)){
                let nameParams = match.slice(1);
                let a = match[0].charAt(match[0].length - 1) === '/' ? match[0].substr(0,match[0].length -1) : match[0];
                let p = obj.req.url.split(a);
                let splits = p[1].split('/').slice(1);

                for(var i = 0; i < splits.length; i++){
                    if(nameParams[i] != undefined || nameParams[i] != null){
                        let str = nameParams[i].charAt(nameParams[i].length - 1) === '/' ? nameParams[i].substr(0,nameParams[i].length -1) : nameParams[i];
                        params[str] = splits[i];
                    }
                }
                
                let conisdencia = obj.req.url.match(regex)[0];
                e['params'] = params;
                arr.push({indice:conisdencia.length,name:conisdencia,obj:e});
            }

            validParams = true;

        } else {
            
            if (e.path === obj.origin && e.method.toLowerCase() === obj.req.method.toLowerCase()) {
                
               return cb({obj:e});
            }
        }
    });

    if(validParams){
        var max = 0;
        for(var i=0; i < arr.length; i++){
            if(max < arr[i].indice){
                max = arr[i].indice;
            }

            if(i == arr.length -1){
                
                return cb(arr.find(e => e.indice === max));
            }
        }
    }
}