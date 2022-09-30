const mongoose = require("mongoose");

const prestamoSchema = new mongoose.Schema({
    fecha_prestamo: Date,
    fecha_devolucion: Date,
    fecha_devol_real: Date,
    lugar: String,
    ejemplar: {type: mongoose.Schema.Types.ObjectId, ref:'Ejemplar'},
    usuario: {type: mongoose.Schema.Types.ObjectId, ref:'Usuario'},
    bibliotecario: {type: mongoose.Schema.Types.ObjectId, ref:'Bibliotecario'},
    comprobante: {type: mongoose.Schema.Types.ObjectId, ref:'Comprobante'}
})

module.exports = mongoose.model('Prestamo', prestamoSchema);