const express = require('express');
const app = express();
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');

var Medico = require('.././models/medico');


//se obtienen todos los médicos
app.get('/medico', (req, res) => {

    desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('medico', 'nombre')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando médicos',
                        errors: err
                    });
                }

                Medico.countDocuments({}, (err, conteo) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando médicos',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                })

            });
});



//se obtiene un medico por id
app.get('/medico/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email')
        .populate('medico', 'nombre')
        .exec((err, medicoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err
                });
            };
            if (!medicoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Id no encontrado'
                    }
                });
            };
            res.json({
                ok: true,
                medico: medicoDB
            });
        });
});

//se actualizara un medico
app.put('/medico/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    //con el underscore (_) ocupando el pick, elegimos los parametros que queremos cambiar. 
    let body = _.pick(req.body, ['nombre', 'img', 'usuario', 'hospital']);

    Medico.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, medicoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        };
        //por si no se crea la categoría
        if (!medicoDB) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        };

        res.json({
            ok: true,
            medico: medicoDB
        });
    });

});


//se crea un medico
app.post('/medico', verificaToken, (req, res) => {

    let id = req.usuario._id;
    let body = req.body;

    let medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        hospital: body.hospital,
        usuario: id
    });

    medico.save((err, medicoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        };
        if (!medicoDB) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        };
        res.json({
            ok: true,
            medico: medicoDB
        });
    });

});


//se borra un medico
app.delete('/medico/:id', verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});



module.exports = app;