const express = require('express');
const app = express();

app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./hospital'));
app.use(require('./medico'));
app.use(require('./busqueda'));
app.use(require('./upload'));
app.use(require('./imagenes'));



module.exports = app;