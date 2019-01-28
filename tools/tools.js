const path = require('path');
const fs = require('fs');
const jwt = require('jwt-simple');
const Response = require('../response');
const NodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

module.exports = {
    generateToken: user => {
        let payload = {
            sub:user._id,
            username:user.name
        }

        return jwt.encode(payload,Response.tkn);
    },

    fileUpload: (obj,name,folder) =>{
        let date = new Date();
        let nombre_nuevo = name + date.getDate() + date.getSeconds() + date.getMilliseconds()+ "_file";
        let ruta_archivo = obj.path;
        let nueva_ruta = path.join(path.resolve(),'public',folder ? folder:"",nombre_nuevo + path.extname(ruta_archivo).toLowerCase());
        let nombre_imagen = nombre_nuevo + path.extname(ruta_archivo).toLowerCase();
        fs.createReadStream(ruta_archivo).pipe(fs.createWriteStream(nueva_ruta));
        return nombre_imagen;
    },

    generateUIAvatar: (name,size = 1024) => {
        let colors = [
            'DC143C',
            '8B0000',
            'C71585',
            'FF1493',
            'FF4500',
            '8A2BE2',
            '8B008B',
            '4B0082',
            '483D8B',
            '2E8B57',
            '008080',
            '191970',
            '800000',
            '000000'
        ];

        function random() {
            return Math.floor(Math.random() * (colors.length - 0)) + 0;
        };

        function colorRandom(){
            return colors[random()];
        }

        return 'https://ui-avatars.com/api/?size='+size.toString()+'&background='+colorRandom()+'&color=fff&name='+name.charAt(0)+'+'+name.charAt(1)
    },

    sendMail: (data,mailOptions,callback) => {
        var transport = NodeMailer.createTransport(smtpTransport(data));
        return transport.sendMail(mailOptions, callback);
    }
}