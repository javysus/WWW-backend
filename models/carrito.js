const mongoose = require("mongoose");

const carritoSchema = new mongoose.Schema({
    solicitudes: [{type: mongoose.Schema.Types.ObjectId, ref:'solicitudCarrito'}],
    usuario: {type: mongoose.Schema.Types.ObjectId, ref:'Usuario', unique: true}
}, {timestamps: true})

module.exports = mongoose.model('Carrito', carritoSchema);