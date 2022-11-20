const mongoose = require("mongoose");

const carritoSchema = new mongoose.Schema({
    libros: [{type: mongoose.Schema.Types.ObjectId, ref:'Libro'}],
    usuario: {type: mongoose.Schema.Types.ObjectId, ref:'Usuario'}
}, {timestamps: true})

module.exports = mongoose.model('Carrito', carritoSchema);