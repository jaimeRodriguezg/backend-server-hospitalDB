const express = require('express');
const app = express();

var Hospital = require('.././models/hospital');
var Medico = require('.././models/medico');
var Usuario = require('../models/usuario');


//Búsqueda por colección
app.get('/busqueda/coleccion/:tabla/:busqueda', (req, res) => {

    let tabla = req.params.tabla;
    let busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');


    if (tabla === 'hospital') {
        buscarHospital(regex).then(hospitales => {
            res.json({
                ok: true,
                hospitales: hospitales
            });
        });
    } else if (tabla === 'medico') {
        buscarMedico(regex).then(medicos => {
            res.json({
                ok: true,
                medicos: medicos
            });
        });
    } else if (tabla === 'usuario') {
        buscarUsuario(regex).then(usuarios => {
            res.json({
                ok: true,
                usuarios: usuarios
            });
        });
    } else {
        res.status(400).json({
            ok: false,
            error: {
                message: 'La búsquedas son solos de médicos, hospitales y usuarios'
            }
        })
    }

});




//Se hace una búsqueda general
app.get('/busqueda/todos/:busqueda', (req, res) => {

    let busqueda = req.params.busqueda;
    //se crea expresion regular
    //i -> insensible a mayúsculas y nimúsculas
    var regex = new RegExp(busqueda, 'i');


    //Permiten mandar un arreglo de promesas y si todas se resuelven, se puede aplicar el then
    //se recibe un arreglo con las respuestas de las promesas
    Promise.all([
            buscarHospital(regex),
            buscarMedico(regex),
            buscarUsuario(regex)
        ])
        .then(respuestas => {
            res.json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            })
        })

})

//trabajaremos con procesos asíncronos, asi se buscaran en médicos, usuarios y hospitales por su cuenta
//y luego se entregará un resultado, ya que no se puede buscar en médicos, usuarios y hospitales en una 
// request get por si sola
function buscarHospital(regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitalesDB) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitalesDB);
                }
            });
    });
}

function buscarMedico(regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicosDB) => {
                if (err) {
                    reject('Error al cargar médicos', err);
                } else {
                    resolve(medicosDB);
                }
            });
    });
}

//buscamos por 2 parametros, email y nombre
function buscarUsuario(regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuariosDB) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuariosDB);
                }
            })
    });
}


module.exports = app;