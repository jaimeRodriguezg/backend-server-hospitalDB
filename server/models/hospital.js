const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const hospitalSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El	nombre	es	necesario']
    },
    img: {
        type: String,
        required: false
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, { collection: 'hospitales' }); //mongoose guardar con ese nombre la colección
module.exports = mongoose.model('Hospital', hospitalSchema);