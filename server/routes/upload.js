const express = require('express');
const fileUpload = require('express-fileupload')
const app = express();

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');


//file system
const fs = require('fs');
const path = require('path');
//middleware que transforma lo que esta subiendo, a un objeto llamado files
app.use(fileUpload({ useTempFiles: true }));

//tipo --> producto o usuario
app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    };
    //Validar tipos
    let tiposValidos = ['usuarios', 'medicos', 'hospitales'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', '),
                tipo: tipo
            }
        });
    }
    //archivo es lo que se envia a través del body - form-data
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];
    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    //validaremos la extensiones
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones validas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    };

    //cambiar nombre del archivo
    //generamos un nombre unico por archivo
    let nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extension}`
        //movemos el archivo a un lugar que deseamos
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        //Se llama a la funcion imagenUsuario para guardar la imagen
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else if (tipo === 'medicos') {
            imagenMedico(id, res, nombreArchivo);
        } else {
            imagenHospital(id, res, nombreArchivo);
        }
    });
});


function imagenMedico(id, res, nombreArchivo) {

    Medico.findById(id, (err, medicoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'medicos');
            return res.status(500).json({
                ok: false,
                err
            });;
        };
        if (!medicoDB) {
            borraArchivo(nombreArchivo, 'medicos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Médico no existe'
                }
            });
        };

        //borramos lo que hay en el sistema
        borraArchivo(medicoDB.img, 'medicos')
        medicoDB.img = nombreArchivo;
        //guardamos la nueva imagen
        medicoDB.save((err, medicoGuardado) => {
            res.json({
                ok: true,
                medico: medicoGuardado,
                img: nombreArchivo
            });
        });
    });
}



//guardara la imagen de los usuarios
function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });;
        };

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        };

        //borramos lo que hay en el sistema
        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;


        //guardamos la nueva imagen
        usuarioDB.save((err, usuarioGuardado) => {
            //así nos mostramos la contraseña real
            usuarioGuardado.password = '2)';

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });

    });
}

//guardara la imagen de los usuarios
function imagenHospital(id, res, nombreArchivo) {

    Hospital.findById(id, (err, hospitalDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'hospitales');
            return res.status(500).json({
                ok: false,
                err
            });;
        };

        if (!hospitalDB) {
            borraArchivo(nombreArchivo, 'hospitales');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Hospital no existe'
                }
            });
        };

        //borramos lo que hay en el sistema
        borraArchivo(hospitalDB.img, 'hospitales');

        hospitalDB.img = nombreArchivo;
        //guardamos la nueva imagen
        hospitalDB.save((err, hospitalGuardado) => {

            res.json({
                ok: true,
                usuario: hospitalGuardado,
                img: nombreArchivo
            });
        });

    });
}

//se mantiene la ultima actualizacion de la imgen subida a usuarios o productos
function borraArchivo(nombreImagen, tipo) {
    //se construye una ruta (un path) , hacia la carpeta de las imagenes de los usuarios, con su imagen respectiva
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    // hay que confirmar si ese path existe
    if (fs.existsSync(pathImagen)) {
        //se borra el archivo
        fs.unlinkSync(pathImagen);
    }
}


module.exports = app;