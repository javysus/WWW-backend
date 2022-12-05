const mongoose = require("mongoose");

const solicitudCarritoSchema = new mongoose.Schema({
    fecha_reserva: Date,
    fecha_estimada: Date,
    lugar: String,
    libro: {type: mongoose.Schema.Types.ObjectId, ref:'Libro'},
    carrito: {type: mongoose.Schema.Types.ObjectId, ref: 'Carrito'},
}, {timestamps: true})

module.exports = mongoose.model('solicitudCarrito', solicitudCarritoSchema);