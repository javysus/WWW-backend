const mongoose = require("mongoose");

const solicitudSchema = new mongoose.Schema({
    estado_solicitud: Boolean,
    fecha_reserva: Date,
    lugar: String,
    libro: {type: mongoose.Schema.Types.ObjectId, ref:'Libro'},
    ejemplar: {type: mongoose.Schema.Types.ObjectId, ref:'Ejemplar'},
    usuario: {type: mongoose.Schema.Types.ObjectId, ref:'Usuario'}
}, {timestamps: true})

module.exports = mongoose.model('Solicitud', solicitudSchema);