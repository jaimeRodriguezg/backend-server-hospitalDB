var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


// ==========================================
//  Verificar token
// ==========================================
let verificaToken = function(req, res, next) {

    var token = req.get('token');

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();


    });
}

let verificaTokenImg = (req, res, next) => {

    //asi se obtienen data del url
    let token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            //401 -> no autorizado
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        //creamos una propiedad en la request como una nueva propiedad usuario el cual es el usuario decodificado
        req.usuario = decoded.usuario;
        next();

    });
}


module.exports = {
    verificaToken,
    verificaTokenImg
}