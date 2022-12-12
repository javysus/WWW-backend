const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");


//const {graphqlExpress, graphiqlExpress} = require("graphql-server-express");
//const {makeExecutableSchema} = require("graphql-tools");

const {ApolloServer, gql} = require("apollo-server-express");


const{merge, filter} = require("lodash");

const{GraphQLDateTime} = require("graphql-iso-date");
const schedule = require('node-schedule');

const Ejemplar = require('./models/ejemplar');
const Libro = require('./models/libro');
const Solicitud = require('./models/solicitud');
const Prestamo = require('./models/prestamo');
const Usuario = require('./models/usuario');
const Bibliotecario = require('./models/bibliotecario');
const Comprobante = require('./models/comprobante');
const Carrito = require("./models/carrito");
const solicitudCarrito = require("./models/solicitudCarrito");

mongoose.connect('mongodb+srv://chocolovers:2605@clusterwww.frnk98m.mongodb.net/bec', {useNewUrlParser: true, useUnifiedTopology: true})

const typeDefs = gql`
scalar Date

type Libro{
    id: ID!
    titulo: String!
    autor: String!
    editorial: String!
    anio: Int
    edicion: String
    categoria: String
    tipo: String!
    subtipo: String!
    ejemplares: [Ejemplar]
    solicitudes: [Solicitud]
    solicitudesCarrito: [solicitudCarrito]
}

type Ejemplar{
    id: ID!
    estado: String!
    ubicacion: String
    libro: Libro!
    prestamo: Prestamo
}

type Catalogo{
    id_libro: ID!
    titulo: String
    autor: String
    editorial: String
    edicion: String
    anio: Int
    categoria: String
    tipo: String
    subtipo: String
    ejemplares_disponibles: Int
    ejemplares_sala: Int
}

type Solicitud{
    id: ID!
    fecha_reserva: Date!
    createdAt: Date
    updatedAt: Date
    estado_solicitud: Boolean
    lugar: String
    libro: Libro!
    ejemplar: Ejemplar!
    usuario: Usuario!
}

type Comprobante{
    id: ID!
    fecha_prestamo: Date!
    usuario: Usuario!
    bibliotecario: Bibliotecario!
    prestamos: [Prestamo]
}

type Prestamo{
    id: ID!
    fecha_prestamo: Date
    fecha_devolucion: Date
    fecha_devol_real: Date
    lugar: String
    ejemplar: Ejemplar!
    usuario: Usuario!
    bibliotecario: Bibliotecario!
    comprobante: Comprobante
}

type Vencido{
    id_prestamo: ID
    fecha_devolucion: Date
    fecha_prestamo: Date
    ejemplar: String
    lugar: String
    duration: Int
    unit: String
    titulo: String
    autor: String
    comprobante: String
}

type Usuario{
    id: ID!
    rut: String!
    nombre: String!
    apellido: String!
    direccion: String!
    telefono: Int!
    correo: String!
    contrasenia: String
    activo: Boolean!
    foto: String
    huella: [Boolean]
    sancion: Date
    prestamos: [Prestamo]
    solicitudes: [Solicitud]
    comprobantes: [Comprobante]
    carrito: Carrito
}

type Bibliotecario{
    id: ID!
    rut: String!
    nombre: String!
    apellido: String!
    correo: String!
    contrasenia: String
    foto: String
    activo: Boolean!
    prestamos: [Prestamo]
    comprobantes: [Comprobante]
}

type solicitudCarrito{
    id: ID!
    libro: Libro!
    lugar: String!
    fecha_reserva: Date!
    fecha_estimada: Date
    carrito: Carrito
    createdAt: Date
    updatedAt: Date
}

type Carrito{
    id: ID!
    solicitudes: [solicitudCarrito]
    usuario: Usuario
    createdAt: Date
    updatedAt: Date
}

type Validacion{
    mensaje: String
    usuario: Boolean!
    bibliotecario: Boolean!
    validacion: Boolean!
    id: ID
}

type ValidacionRut{
    validacion: Boolean
    usuario: ID
}

input solicitudCarritoInput{
    libro: String!
    lugar: String!
    fecha_reserva: Date!
    fecha_estimada: Date!
    carrito: String!
}

input BibliotecarioInput{
    rut: String!
    nombre: String!
    apellido: String!
    correo: String!
    contrasenia: String
    foto: String
}

input BibliotecarioActualizar{
    rut: String
    nombre: String
    apellido: String
    correo: String
    contrasenia: String
    foto: String
    activo: Boolean
}

input UsuarioInput{
    rut: String!
    nombre: String!
    apellido: String!
    direccion: String!
    telefono: Int!
    correo: String!
    contrasenia: String
    foto: String
    huella: [Boolean]
}

input UsuarioActualizar{
    rut: String
    nombre: String
    apellido: String
    direccion: String
    telefono: Int
    correo: String
    contrasenia: String
    activo: Boolean
    foto: String
    huella: [Boolean]
}

input LibroInput{
    titulo: String!
    autor: String!
    editorial: String!
    anio: Int
    edicion: String
    categoria: String
    tipo: String!
    subtipo: String!
}

input LibroActualizar{
    titulo: String
    autor: String
    editorial: String
    anio: Int
    edicion: String
    categoria: String
    tipo: String
    subtipo: String
}

input EjemplarInput{
    ubicacion: String
    libro: String!
}

input EjemplarActualizar{
    ubicacion: String
}

input SolicitudInput{
    id_libro: String!
    id_usuario: String!
    fecha_reserva: Date!
    lugar: String!
}

input SolicitudActualizar{
    estado_solicitud: Boolean
    ejemplar: String!
    bibliotecario: String!
}

input PrestamoInput{
    fecha_prestamo: Date!
    lugar: String!
    ejemplar: String!
    usuario: String!
    bibliotecario: String!
    comprobante: String
}

input PrestamoActualizar{
    fecha_devol_real: Date
}

input ComprobanteInput{
    fecha_prestamo: Date!
    usuario: String!
    bibliotecario: String!
}

input CarritoInput{
    usuario: String!
}

input LibroToCarritoInput{
    id_carrito: String!
    solicitud: String!
    usuario: String!
}

type Alert{
    message: String
}

type Query {
    getLibros: [Libro]
    getLibro(id: ID!): Libro 
    getLibrosCatalogo(titulo: String, autor: String, categoria: String): [Catalogo]
    getEjemplares: [Ejemplar]
    getEjemplar(id: ID!): Ejemplar
    getEjemplaresByEstado(estado: String): [Ejemplar]
    getSolicitudes: [Solicitud]
    getSolicitudesByUsuario(usuario: String): [Solicitud]
    getSolicitudesByBibliotecario(bibliotecario: String): [Solicitud]
    getSolicitud(id: ID!): Solicitud
    getSolicitudEstado(estado_solicitud: Boolean): [Solicitud]
    getPrestamos: [Prestamo]
    getPrestamo(id: ID!): Prestamo
    getUsuarios: [Usuario]
    getUsuario(id: ID!): Usuario
    getBibliotecarios: [Bibliotecario]
    getBibliotecario(id: ID!): Bibliotecario
    getComprobante(id: ID!): Comprobante
    getComprobantesByUsuario(usuario: String): [Comprobante]
    getComprobantesByBibliotecario(bibliotecario: String): [Comprobante]
    getPrestamosVencidos(lugar: String): [Vencido]
    getPrestamosByUsuario(usuario: String): [Prestamo]
    getPrestamosByBibliotecario(bibliotecario: String): [Prestamo]
    ValidacionUsuario(correo: String, contrasenia: String): Validacion
    ValidacionBibliotecario(correo: String, contrasenia: String): Boolean
    ValidacionRutUsuario(rut: String, huella: [Boolean]): ValidacionRut
    getCarrito(usuario: String): Carrito
}

type Mutation {
    addLibro(input: LibroInput): Libro
    updateLibro(id: ID!, input: LibroActualizar): Libro
    deleteLibro(id: ID!): Alert
    addEjemplar(input: EjemplarInput): Ejemplar
    updateEjemplar(id: ID!, input: EjemplarActualizar): Ejemplar
    deleteEjemplar(id: ID!): Alert
    addSolicitud(input: SolicitudInput): Solicitud
    updateSolicitud(id: ID!, input: SolicitudActualizar): Solicitud
    deleteSolicitud(id: ID!): Alert
    addPrestamo(input: PrestamoInput): Prestamo
    updatePrestamo(id: ID!): Prestamo
    deletePrestamo(id: ID!): Alert
    addUsuario(input: UsuarioInput): Usuario
    updateUsuario(id: ID!, input: UsuarioActualizar): Usuario
    deleteUsuario(id: ID!): Alert
    addBibliotecario(input: BibliotecarioInput): Bibliotecario
    updateBibliotecario(input: BibliotecarioActualizar): Bibliotecario
    deleteBibliotecario(id: ID!): Alert
    addComprobante(input: ComprobanteInput): Comprobante
    deleteComprobante(id: ID!): Alert
    addLibroToCarrito(input: solicitudCarritoInput): Carrito
    deleteLibroInCarrito(id: ID!): Alert
    resetCarrito(id: ID!): Alert
}`;

const resolvers = {
    Date: GraphQLDateTime,
    Query: {
        async getLibros(obj){
            const libros = await Libro.find();
            return libros;
        },

        async getLibro(obj, { id }){
            const libro = await Libro.findById(id).populate('ejemplares');
            return libro;
        },

        //Para la búsqueda de libros
        async getLibrosCatalogo(obj, { titulo, autor, categoria}){
            var query = {
            };
            if (titulo){
                query.titulo = {$regex: '.*'+titulo+'.*', $options:'i'};
            }

            if (autor){
                query.autor = {$regex: '.*'+autor+'.*', $options:'i'};
            }

            if (categoria){
                query.categoria = categoria;
            }

            const libros_dos = await Libro.aggregate([
                {
                  "$match": /*{
                    "titulo": "Punk 57",
                    "autor": "Penelope Douglas"
                  }*/ query
                },{"$lookup": {
                    "from": "ejemplars",
                    "localField": "ejemplares",
                    "foreignField": "_id",
                    "as": "ejemplares"
                }},
                {
                  "$unwind": "$ejemplares"
                }/*,
                {
                  "$match": {
                    "ejemplares.estado": "Disponible"
                  }
                }*/,
                {
                  "$group": {
                    "_id": "$_id",
                    "id_libro": {
                        "$first": "$_id"
                      },
                    "titulo": {
                      "$first": "$titulo"
                    },
                    "autor": {
                      "$first": "$autor"
                    },
                    "editorial": {
                        "$first": "$editorial"
                    },
                    "anio": {
                        "$first": "$anio"
                    },
                    "edicion": {
                        "$first": "$edicion"
                    },
                    "categoria": {
                        "$first": "$categoria"
                    },
                    "tipo": {
                        "$first": "$tipo"
                    },
                    "subtipo": {
                        "$first": "$subtipo"
                    },
                    "ejemplares_disponibles": {
                      //"$sum": 1
                      $sum: { "$cond": [{ "$eq": ["$ejemplares.estado", "Disponible"] }, 1, 0] }
                    },
                    "ejemplares_sala": {
                        //"$sum": 1
                        $sum: { "$cond": [{ "$eq": ["$ejemplares.estado", "Sala"] }, 1, 0] }
                      }
                  }
                }
              ])

            console.log(libros_dos);
            return libros_dos;
        },

        async getEjemplar(obj, { id }){
            const ejemplar = await Ejemplar.findById(id);
            return ejemplar;
        },

        async getEjemplares(obj){
            const ejemplares = await Ejemplar.find().populate('libro');
            return ejemplares;
        },

        async getEjemplaresByEstado(obj, {estado}){
            const ejemplares = await Ejemplar.find({estado: estado});
            return ejemplares;
        },

        async getSolicitudes(obj){
            const solicitudes = await Solicitud.find().populate('libro');
            return solicitudes;
        },

        async getSolicitud(obj, { id }){
            const solicitud = await Solicitud.findById(id).populate('libro').populate('usuario');
            return solicitud;
        },

        async getSolicitudEstado(obj, { estado_solicitud }){
            var query = {
                "estado_solicitud": estado_solicitud
            }
            const solicitudes = await Solicitud.find(query).sort({createdAt: -1}).populate('libro').populate({path: 'libro', populate: { path: 'ejemplares', match: {
                estado: 'Disponible'
              } }});
            return solicitudes;
        },

        async getSolicitudesByUsuario(obj, {usuario}){
            const solicitudes = await Solicitud.find({usuario: usuario}).populate('libro');

            return solicitudes;
        },
        async getSolicitudesByBibliotecario(obj, {bibliotecario}){
            const solicitudes = await Solicitud.find({bibliotecario: bibliotecario}).populate('libro').populate('ejemplar');

            return solicitudes;
        },

        async getUsuarios(obj){
            const usuarios = await Usuario.find();
            return usuarios;
        },

        async getUsuario(obj, { id }){
            const usuario = await Usuario.findById(id).populate('prestamos').populate('solicitudes').populate('carrito');
            return usuario;
        },

        async getBibliotecarios(obj){
            const usuarios = await Bibliotecario.find();
            return usuarios;
        },

        async getBibliotecario(obj, { id }){
            const usuario = await Bibliotecario.findById(id);
            return usuario;
        },

        async getComprobante(obj, {id}){
            const comprobante = await Comprobante.findById(id).populate('usuario').populate('bibliotecario').populate('prestamos').populate({path: 'prestamos', populate: { path: 'ejemplar' }}).populate({path: 'prestamos', populate: { path: 'ejemplar' , populate: {path: 'libro'}}});
            console.log(comprobante);
            return comprobante;
        },

        async getComprobantesByUsuario(obj, {usuario}){
            const comprobante = await Comprobante.find({usuario: usuario}).populate('prestamos');
            return comprobante;
        },

        async getComprobantesByBibliotecario(obj, {bibliotecario}){
            const comprobante = await Comprobante.find({bibliotecario: bibliotecario}).populate('prestamos');
            return comprobante;
        },

        async getPrestamos(obj){
            const prestamos = await Prestamos.find();
            return prestamos;
        },

        async getPrestamo(obj, { id }){
            const prestamo = await Prestamo.findById(id).populate('ejemplar').populate('usuario').populate('bibliotecario').populate({ path: 'ejemplar' , populate: {path: 'libro'}});
            return prestamo;
        },

        async getBibliotecarios(obj){
            const usuarios = await Bibliotecario.find();
            return usuarios;
        },

        async getPrestamosByUsuario(obj, {usuario}){
            const prestamo = await Prestamo.find({usuario: usuario}).populate('ejemplar').populate('bibliotecario').populate('comprobante');
            return prestamo;
        },

        async getPrestamosByBibliotecario(obj, {bibliotecario}){
            const prestamo = await Prestamo.find({bibliotecario: bibliotecario}).populate('ejemplar').populate('usuario').populate('comprobante');
            return prestamo;
        },

        //Colocar diferencia
        async getPrestamosVencidos(obj, {lugar}){
            var unit;
            var unidad;
            if (lugar === "Sala Lectura" || lugar === "Sala Multimedia"){
                unit = "hour"
                unidad = "horas"
            }
            else if (lugar === 'Casa'){
                unit = "day"
                unidad = "dias"
            } else{
                console.log('Ingrese lugar válido');
                return null
            }
            var date = new Date();
            //const prestamos = await Prestamo.find({lugar: lugar, fecha_devolucion: {$lt: date}}).sort({fecha_devolucion: 'asc'}).populate('ejemplar');
            const prestamos = await Prestamo.aggregate([{
                "$match": {lugar: lugar, fecha_devolucion: {$lt: date}}
              },
              {"$lookup": {
                "from": "ejemplars",
                "localField": "ejemplar",
                "foreignField": "_id",
                "as": "ejemplar"
            }},
            {"$lookup": {
                "from": "libros",
                "localField": "ejemplar.libro",
                "foreignField": "_id",
                "as": "libro"
            }},
                {"$project": {
                    id_prestamo: "$_id",
                    duration: /*{"$subtract": [date, "$fecha_devolucion"]}*/ {"$dateDiff":
                    {
                        startDate: "$fecha_devolucion",
                        endDate: date,
                        unit: unit
                    }},
                    lugar: 1,
                    fecha_devolucion: 1,
                    fecha_prestamo: 1,
                    ejemplar: { "$first":
                        "$ejemplar._id"},
                    titulo: {"$first": "$libro.titulo"},
                    autor: {"$first": "$libro.autor"},
                    unit: unidad,
                    libro: 1,
                    comprobante: 1
                }}])
            console.log(prestamos);
            return prestamos; //Para ver el contacto del usuario
        },
        async ValidacionUsuario(obj, {correo, contrasenia}){
            const cuenta = await Usuario.findOne({correo: correo});
            const bibliotecario = await Bibliotecario.findOne({correo: correo});
            let usuario = false;
            let usuarioBiblio = false;
            let validacion = false;
            let mensaje;
            let id;
            if (cuenta !== null){
                usuario = true;
                if (contrasenia === cuenta.contrasenia){
                    mensaje = "Sesión iniciada";
                    validacion = true;
                    id = cuenta._id;
                }
                else{
                    mensaje = "Contraseña incorrecta";
                    console.log("Contraseña incorrecta.")
                }
            } else if (bibliotecario !== null){
                usuarioBiblio = true;
                if (contrasenia === bibliotecario.contrasenia){
                    mensaje = "Sesión iniciada";
                    validacion = true;
                    id = bibliotecario._id;
                }
                else{
                    mensaje = "Contraseña incorrecta";
                    console.log("Contraseña incorrecta.")
                    
                } 
            }else{
                mensaje = "No se encontró un usuario con este correo.";
                console.log("No se encontró un usuario con este correo.")
            }

            return {mensaje: mensaje, usuario: usuario, bibliotecario: usuarioBiblio, validacion: validacion, id: id}
        },
        async ValidacionBibliotecario(obj, {correo, contrasenia}){
            const cuenta = await Bibliotecario.find({correo: correo});
            if (cuenta !== null){
                if (contrasenia === cuenta.contrasenia){
                    return true;
                }
                else{
                    console.log("Contraseña incorrecta.")
                    return false;
                }
            } else{
                console.log("No se encontró un bibliotecario con este correo.")
                return null;
            }
        },
        async ValidacionRutUsuario(obj, {rut, huella}){
            const cuenta = await Usuario.findOne({rut: rut});
            var validacion = true;
            
            if (cuenta !== null){
                var usuario = cuenta._id;
                if (huella.length !== cuenta.huella.length){
                    validacion = false;
                    usuario = null;
                }

                for(var i=0;i<huella.length;i++){
                    if(huella[i] != cuenta.huella[i]){
                        validacion = false;
                        usuario = null;
                    }
                }
                if (validacion === false){
                    console.log("Vuelva a colocar su huella.")
                }
                
                return {validacion: validacion, usuario: usuario};
            } else{
                console.log("No se encontró un usuario con este rut.")
                return {validacion: null, usuario: null};
            }
        },
        async getCarrito(obj, {usuario}){
            const carrito = await Carrito.findOne({usuario: usuario}).populate('solicitudes').populate({path: 'solicitudes', populate: { path: 'libro'}});
            console.log("Carrito", carrito);
            return carrito;
        }
    },

    Mutation: {
        async addLibro(obj, { input }){
            console.log(input);
            const libro = new Libro(input);
            await libro.save();
            return libro;
        },

        async addEjemplar(obj, { input }){
            let {ubicacion, libro} = input;
            let libroFind = await Libro.findById(libro);
            if(libroFind !== null){
                const ejemplar = new Ejemplar({estado: 'Disponible', ubicacion: ubicacion, libro: libroFind._id})

                //Agregar referencia al libro
                libroFind.ejemplares.push(ejemplar._id);
                await libroFind.save();

                await ejemplar.save();
                return ejemplar; //Agregar .populate('libro') si queremos mostrar datos del libro 
            } else{
                console.log("Ingrese un ejemplar válido")
                return null;
            }
        },

        async addSolicitud(obj, {input}){
            let {id_libro, id_usuario, fecha_reserva, lugar} = input;
            console.log(id_libro);
            let libroFind = await Libro.findById(id_libro);
            let usuarioFind = await Usuario.findById(id_usuario);
            if(libroFind !== null && usuarioFind !== null){
                const solicitud = new Solicitud({estado_solicitud: false, fecha_reserva: fecha_reserva, libro: libroFind._id, usuario: usuarioFind._id, lugar: lugar, bibliotecario: null})

                //Agregar referencia al libro
                libroFind.solicitudes.push(solicitud._id);
                await libroFind.save();

                //Agregar referencia a usuario
                usuarioFind.solicitudes.push(solicitud._id);
                await usuarioFind.save();

                await solicitud.save();

                return solicitud;
            } else{
                console.log("Ingrese un libro y/o usuario válido")
                return null;
            }
        },

        async addPrestamo(obj, {input}){
            let {fecha_prestamo, lugar, ejemplar, usuario, bibliotecario, comprobante} = input;
            let ejemplarFind = await Ejemplar.findById(ejemplar);
            let usuarioFind = await Usuario.findById(usuario);
            let bibliotecarioFind = await Bibliotecario.findById(bibliotecario);
            let comprobanteFind = await Comprobante.findById(comprobante);

            let fecha_devolucion = new Date(fecha_prestamo.getTime());
           
            let libroFind = await Libro.findById(ejemplarFind.libro);

            let tipo = libroFind.tipo;

            if(tipo === 'Libro'){
                if (lugar === 'Casa'){
                    fecha_devolucion.setDate(fecha_prestamo.getDate() + 15);
                }

                else if (lugar === 'Sala Lectura'){
                    let tiempoMillis = 5 * 60 * 60 * 1000; 
                    fecha_devolucion.setTime(fecha_prestamo.getTime()+tiempoMillis);
                }

                else{
                    console.log("Ingrese lugar de préstamo correcto");
                    return null;
                }
            }

            else if(tipo == 'Multimedia'){
                if (lugar == 'Casa'){
                    fecha_devolucion.setDate(fecha_prestamo.getDate() + 7)
                }
                
                else if (lugar === 'Sala Multimedia'){
                    let tiempoMillis = 3 * 60 * 60 * 1000; 
                    fecha_devolucion.setTime(fecha_prestamo.getTime() + tiempoMillis)
                }

                else{
                    console.log("Ingrese lugar de préstamo correcto");
                    return null;
                }
            }

            else{
                console.log("Ingrese tipo de libro correcto");
                return null;
            }

            if(ejemplarFind !== null && usuarioFind !== null && bibliotecarioFind !== null && comprobanteFind !== null){
                const prestamo = new Prestamo({fecha_prestamo: fecha_prestamo, fecha_devolucion: fecha_devolucion, lugar: lugar, ejemplar: ejemplarFind._id, usuario: usuarioFind._id, bibliotecario: bibliotecarioFind._id, comprobante: comprobanteFind._id})

                //Agregar referencia al libro
                await ejemplarFind.updateOne({prestamo: prestamo._id, estado: lugar});

                //Agregar referencia a usuario
                usuarioFind.prestamos.push(prestamo._id);
                await usuarioFind.save();

                //Agregar referencia a bibliotecario
                bibliotecarioFind.prestamos.push(prestamo._id);
                await bibliotecarioFind.save();

                //Agregar referencia a comprobante
                comprobanteFind.prestamos.push(prestamo._id);
                await comprobanteFind.save();

                await prestamo.save();

                return prestamo;
            } else{
                console.log("Ingrese ejemplar, usuario, comprobante y/o bibliotecario válidos")
                return null;
            }
        },

        async addUsuario(obj, {input}){
            let {rut, nombre, apellido, direccion, telefono, correo, contrasenia, foto, huella} = input;
            console.log(rut);

            usuario_correo = await Usuario.find({correo: correo});
            usuario_rut = await Usuario.find({rut: rut});

            if (usuario_correo.length !== 0 || usuario_rut.length !== 0){
                console.log('Usuario ya existente');
                return null
            }
            else{
                const usuario = new Usuario({rut: rut, nombre: nombre, apellido: apellido, direccion: direccion, telefono: telefono, correo: correo, contrasenia: contrasenia, foto: foto, huella: huella, activo: false});
                await usuario.save();

                const carrito = new Carrito({usuario: usuario._id});
                await carrito.save();

                await Usuario.findByIdAndUpdate(usuario._id, {carrito: carrito._id}, {new: true});

                console.log(usuario);
                return usuario;

                
            }
            
            
        },

        async addBibliotecario(obj, {input}){
            let {rut, nombre, apellido, correo, contrasenia, foto} = input;

            bib_correo = await Bibliotecario.find({correo: correo});
            bib_rut = await Bibliotecario.find({rut: rut});

            if (bib_correo.length !== 0 && bib_rut.length !== 0){
                console.log('Bibliotecario ya existente');
                return null
            } else{
                const bibliotecario = new Bibliotecario({rut: rut, nombre: nombre, apellido: apellido, correo: correo, contrasenia: contrasenia, foto: foto, activo: true});
                await bibliotecario.save();
                return bibliotecario
            }
        },

        async addComprobante(obj, {input}){
            const comprobante = new Comprobante(input);
            await comprobante.save();

            let {fecha_prestamo, usuario, bibliotecario} = input;
            const usuarioFind = await Usuario.findById(usuario);

            usuarioFind.comprobantes.push(comprobante._id);
            await usuarioFind.save();
            
            return comprobante
        },

        async addLibroToCarrito(obj, {input}){
            let {carrito, libro, lugar, fecha_reserva, fecha_estimada} = input;

            
            carritoFind = await Carrito.findById(carrito);
            libroFind = await Libro.findById(libro);
            const solicitud = new solicitudCarrito({libro: libroFind._id, carrito: carritoFind._id, lugar:lugar, fecha_reserva: fecha_reserva, fecha_estimada: fecha_estimada});
            await solicitud.save();

            console.log(solicitud);
            carritoFind.solicitudes.push(solicitud._id);
            await carritoFind.save();

            libroFind.solicitudesCarrito.push(carritoFind._id);
            await libroFind.save();

            return carritoFind;
        },

        async deleteLibroInCarrito(obj, {id}){
            solicitudCarritoFind = await solicitudCarrito.findById(id);
            carritoFind = await Carrito.findById(solicitudCarritoFind.carrito);
            libroFind = await Libro.findById(solicitudCarritoFind.libro);

            carritoFind.solicitudes.pop(solicitudCarritoFind._id);
            await carritoFind.save();

            libroFind.solicitudesCarrito.pop(solicitudCarritoFind._id);
            await libroFind.save();

            await solicitudCarritoFind.deleteOne({_id: solicitudCarritoFind._id});
            
            return {
                message: "Solicitud eliminada de carrito"
            }
        },

        async resetCarrito(obj, {id}){
            carritoFind = await Carrito.findByIdAndUpdate(id, {solicitudes: []}, {new: true});
            console.log(carritoFind);
            await carritoFind.save();

            console.log("Carrito reseteado");
            return {message: "Carrito reseteado"};
        },

        async updateLibro(obj, { id, input }){
            const libro = await Libro.findByIdAndUpdate(id, input,{new: true});
            return libro;
        },

        async updateEjemplar(obj, { id, input }){
            const ejemplar = await Ejemplar.findByIdAndUpdate(id, input,{new: true});
            return ejemplar;
        },

        async updateSolicitud(obj, { id, input}){
            let {estado_solicitud, ejemplar, bibliotecario} = input;

            const ejemplarFind = await Ejemplar.findById(ejemplar);

            if(ejemplarFind !== null){
                const bibliotecarioFind = await Bibliotecario.findById(bibliotecario);
                const solicitud = await Solicitud.findByIdAndUpdate(id, {estado_solicitud: estado_solicitud, ejemplar: ejemplarFind._id}, {new: true});
                await ejemplarFind.updateOne({estado: 'Reservado', bibliotecario: bibliotecarioFind._id});

                return solicitud;
            } else{
                console.log("Ingrese una solicitud válida");
            }
            
            
        },

        //Asumimos que no se puede extender el plazo del prestamo
        async updatePrestamo(obj, {id}){
            let fecha_devol_real = new Date();
            const prestamo = await Prestamo.findByIdAndUpdate(id, {fecha_devol_real: fecha_devol_real}, {new: true});

            //Liberar ejemplar
            const ejemplar = await Ejemplar.findById(prestamo.ejemplar);
            await ejemplar.updateOne({estado: 'Devuelto', prestamo: null});

            let fecha_devolucion = prestamo.fecha_devolucion;

            //Actualizar a disponible despues de 30 minutos
            let fecha_actualizar = new Date(fecha_devol_real.getTime());
            fecha_actualizar.setTime(fecha_actualizar.getTime()+(30*60*1000));
            const job = schedule.scheduleJob(fecha_actualizar, async function(){
                await ejemplar.updateOne({estado: 'Disponible'});
                console.log('Ejemplar ', ejemplar._id, ' disponible');
            });

            //Calcular sancion
            var diff = (fecha_devol_real - fecha_devolucion);

            //fecha_devolucion.setTime(fecha_prestamo.getTime()+tiempoMillis);
            if (diff > 0){
                let fecha_sancion = new Date(fecha_devol_real.getTime());
                //Triplica
                fecha_sancion.setTime(fecha_sancion.getTime()+(diff*3));
                const usuario = await Usuario.findByIdAndUpdate(prestamo.usuario, {sancion: fecha_sancion}, {new: true});
                
            }
            return prestamo;
        },
        
        async updateUsuario(obj, { id, input }){
            const usuario = await Usuario.findByIdAndUpdate(id, input,{new: true});
            return usuario;
        },

        async updateBibliotecario(obj, { id, input}){
            const bibliotecario = await Bibliotecario.findByIdAndUpdate(id, input, {new:true});
            return bibliotecario;
        },

        async deleteLibro(obj, { id }){
            await Libro.deleteOne({_id: id});
            return {
                message: "Libro eliminado"
            }
        },

        async deleteEjemplar(obj, { id }){
            const ejemplar = await Ejemplar.findById(id);
            const libroFind = await Libro.findById(ejemplar.libro);

            //Eliminar ejemplar del libro
            if(libroFind !== null){
                libroFind.ejemplares.pop(ejemplar._id);
                await libroFind.save();

                //Eliminar ejemplar
                await Ejemplar.deleteOne(ejemplar);
                return {
                    message: "Ejemplar eliminado"
                }
            } else{
                return {
                    message: "Ingrese ejemplar y libro validos"
                }
            }
        },

        async deleteSolicitud(obj, { id }){
            const solicitud = await Solicitud.findById(id);
            const libroFind = await Solicitud.findById(solicitud.libro);
            const usuarioFind = await Usuario.findById(solicitud.usuario);

            if(libroFind !== null && usuarioFind !== null){
                usuarioFind.solicitudes.pop(solicitud._id);
                libroFind.solicitudes.pop(solicitud._id);

                await usuarioFind.save();
                await libroFind.save();

                
                await Solicitud.deleteOne(solicitud);

                
                return {
                    message: "Solicitud eliminada"
                }
            } else{
                return {
                    message: "Ingrese libro y usuario validos"
                }
            }
        },

        async deletePrestamo(obj, { id}){
            const prestamo = await Prestamo.findById(id);
            const ejemplarFind = await Ejemplar.findById(prestamo.ejemplar);
            const usuarioFind = await Usuario.findById(prestamo.usuario);
            const bibliotecarioFind = await Bibliotecario.findById(prestamo.bibliotecario);

            if (ejemplarFind !== null && usuarioFind !== null && bibliotecarioFind !== null){
                usuarioFind.prestamos.pop(prestamo._id);
                bibliotecarioFind.prestamos.pop(prestamo._id);

                await usuarioFind.save();
                await bibliotecarioFind.save();
                await ejemplarFind.updateOne({prestamo: null});
                
                
                await Prestamo.deleteOne(prestamo);
                
                return {
                    message: "Prestamo eliminado"
                }
            } else {
                return {
                    message: "Ingrese ejemplar, usuario y bibliotecario validos"
                }
            }
        },

        async deleteUsuario(obj, { id }){
            const usuario = await Usuario.findById(id);
            //const prestamosFind = await Prestamo.findById(usuario.prestamos);
            //const solicitudesFind = await Solicitud.findById(usuario.solicitudes);
            //console.log(prestamosFind);

            if (usuario !== null){
                for (const i in usuario.prestamos){
                    //console.log(i);
                    let prestamo = await Prestamo.findById(usuario.prestamos[i]);
                    await prestamo.updateOne({usuario: null});
                }
    
                for (const i in usuarios.solicitudes){
                    let solicitud = await Solicitud.findById(usuario.solicitudes[i]);
                    await solicitud.updateOne({usuario: null});
                }
    
                await Usuario.deleteOne({_id: id});
                return {
                    message: "Usuario eliminado"
                }
            }
            else{
                return {
                    message: "Ingrese usuario valido"
                }
            }
            
        },

        async deleteBibliotecario(obj, { id }){
            const bibliotecario = await Bibliotecario.findById(id);
            
            if (bibliotecario !== null){
                for (const i in bibliotecario.prestamos){
                    //console.log(i);
                    let prestamo = await Prestamo.findById(bibliotecario.prestamos[i]);
                    await prestamo.updateOne({bibliotecario: null});
                }
    
                await Bibliotecario.deleteOne({_id: id});
                return {
                    message: "Bibliotecario eliminado"
                }
            }
            else{
                return {
                    message: "Ingrese bibliotecario valido"
                }
            }
            
        },

        async deleteComprobante(obj, {id}){
            const comprobante = await Comprobante.findById(id);

            if (comprobante !== null){
                for (const i in comprobante.prestamos){
                    //console.log(i);
                    let prestamo = await Prestamo.findById(comprobante.prestamos[i]);
                    await prestamo.updateOne({comprobante: null});
                }
    
                await comprobante.deleteOne({_id: id});
                return {
                    message: "Comprobante eliminado"
                }
            }
            else{
                return {
                    message: "Ingrese comprobante valido"
                }
            }
        }
    }
}

let apolloServer = null;
const corsOptions = {
    origin: "http://localhost:8090",
    credentials: false
}

async function startServer(){
    const apolloServer = new ApolloServer({typeDefs, resolvers, corsOptions});
    await apolloServer.start();

    apolloServer.applyMiddleware({app, cors: false});
}

startServer();

const app = express();
app.use(cors());
app.listen(8090, function(){
    console.log("Servidor iniciado")
})