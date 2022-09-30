const mongoose = require("mongoose");

const comprobanteSchema = new mongoose.Schema({
    fecha_prestamo: Date,
    usuario: {type: mongoose.Schema.Types.ObjectId, ref:'Usuario'},
    bibliotecario: {type: mongoose.Schema.Types.ObjectId, ref:'Bibliotecario'},
    prestamos: [{type: mongoose.Schema.Types.ObjectId, ref:'Prestamo'}]
})

module.exports = mongoose.model('Comprobante', comprobanteSchema);