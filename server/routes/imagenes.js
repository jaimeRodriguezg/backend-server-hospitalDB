const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { verificaTokenImg } = require('../middlewares/autenticacion')


//creamos una ruta para desplegar las imagenes
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        //envía como respuesta la imagen
        res.sendFile(pathImagen);
    } else {
        //crearemos el path para mostrar cuando no hay imagen
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg')
        res.sendFile(noImagePath);

    }

})




module.exports = app;