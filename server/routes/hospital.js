const express = require('express');
const app = express();
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');

var Hospital = require('.././models/hospital');


//se obtienen todos los hospitales
app.get('/hospital', (req, res) => {

    desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospital.countDocuments({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error contando hospitales',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });
        });
});



//se obtiene un hospital por id
app.get('/hospital/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre email')
        .exec((err, hospitalDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err
                });
            };
            if (!hospitalDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Id no encontrado'
                    }
                });
            };
            res.json({
                ok: true,
                hospital: hospitalDB
            });
        });
});

//se actualizara un hospital
app.put('/hospital/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    //con el underscore (_) ocupando el pick, elegimos los parametros que queremos cambiar. 
    let body = _.pick(req.body, ['nombre', 'img']);

    Hospital.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, hospitalDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        };
        //por si no se crea la categoría
        if (!hospitalDB) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        };

        res.json({
            ok: true,
            hospital: hospitalDB
        });
    });

});


//se crea un hospital

app.post('/hospital', verificaToken, (req, res) => {

    let id = req.usuario._id;
    let body = req.body;

    let hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: id
    });

    hospital.save((err, hospitalDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        };
        if (!hospitalDB) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        };
        res.json({
            ok: true,
            hospital: hospitalDB
        });
    });

});


//se borra un hospital
app.delete('/hospital/:id', verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});



module.exports = app;