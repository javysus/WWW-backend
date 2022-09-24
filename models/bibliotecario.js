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
})

module.exports = mongoose.model('Bibliotecario', bibliotecarioSchema);
