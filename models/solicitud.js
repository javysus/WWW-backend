const mongoose = require("mongoose");

const solicitudSchema = new mongoose.Schema({
    estado_solicitud: Boolean,
    libro: {type: mongoose.Schema.Types.ObjectId, ref:'Libro'},
    usuario: {type: mongoose.Schema.Types.ObjectId, ref:'Usuario'}
}, {timestamps: true})

module.exports = mongoose.model('Solicitud', solicitudSchema);