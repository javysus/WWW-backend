const mongoose = require("mongoose");

const libroSchema = new mongoose.Schema({
    titulo: String,
    autor: String,
    editorial: String,
    anio: Number,
    edicion: String,
    categoria: String,
    tipo: String, //libro o multimedia
    subtipo: String,
    ejemplares: [{type: mongoose.Schema.Types.ObjectId, ref:'Ejemplar'}],
    solicitudes: [{type: mongoose.Schema.Types.ObjectId, ref:'Solicitud'}],
    carritos: [{type: mongoose.Schema.Types.ObjectId, ref:'Carrito'}]
})

module.exports = mongoose.model('Libro', libroSchema);
