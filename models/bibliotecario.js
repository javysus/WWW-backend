const mongoose = require("mongoose");

const bibliotecarioSchema = new mongoose.Schema({
    rut: String,
    nombre: String,
    apellido: String,
    correo: String,
    contrasenia: String,
    foto: String,
    activo: Boolean,
    prestamos: [{type: mongoose.Schema.Types.ObjectId, ref:'Prestamo'}],
    solicitudes: [{type: mongoose.Schema.Types.ObjectId, ref:'Solicitud'}],
    comprobantes: [{type: mongoose.Schema.Types.ObjectId, ref:'Comprobante'}]
})

module.exports = mongoose.model('Bibliotecario', bibliotecarioSchema);
