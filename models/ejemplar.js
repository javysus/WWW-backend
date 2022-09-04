const mongoose = require("mongoose");

const ejemplarSchema = new mongoose.Schema({
    estado: String,
    ubicacion: String,
    libro: {type: mongoose.Schema.Types.ObjectId, ref:'Libro'}
})

module.exports = mongoose.model('Ejemplar', ejemplarSchema);