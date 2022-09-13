const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
    rut: String,
    nombre: String,
    direccion: String,
    telefono: Number,
    correo: String,
    contrasenia: String,
    activo: Boolean,
    foto: String,
    huella: [Boolean],
    prestamos: {type: mongoose.Schema.Types.ObjectId, ref:'Prestamo'},
    solicitudes: {type: mongoose.Schema.Types.ObjectId, ref:'Solicitud'}
})

module.exports = mongoose.model('Usuario', usuarioSchema);
