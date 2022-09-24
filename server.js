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
    fecha_reserva: Date
    createdAt: Date
    updatedAt: Date
    estado_solicitud: Boolean
    libro: Libro!
    ejemplar: Ejemplar!
    usuario: Usuario!
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
}

type Vencido{
    id_prestamo: ID
    fecha_devolucion: Date
    lugar: String
    duration: Int
    unit: String
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
    contrasenia: String!
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
}

input SolicitudActualizar{
    estado_solicitud: Boolean
    ejemplar: String
}

input PrestamoInput{
    lugar: String!
    ejemplar: String!
    usuario: String!
    bibliotecario: String!
}

input PrestamoActualizar{
    fecha_devol_real: Date
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
    getSolicitudes: [Solicitud]
    getSolicitud(id: ID!): Solicitud
    getSolicitudEstado(estado_solicitud: Boolean): [Solicitud]
    getPrestamos: [Prestamo]
    getPrestamo(id: ID!): Prestamo
    getUsuarios: [Usuario]
    getUsuario(id: ID!): Usuario
    getBibliotecarios: [Bibliotecario]
    getBibliotecario(id: ID!): Bibliotecario
    getComprobante(fecha_prestamo: Date): [Prestamo]
    getPrestamosVencidos(lugar: String): [Vencido] 
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
                query.titulo = {$regex: '.*'+titulo+'.*'};
            }

            if (autor){
                query.autor = {$regex: '.*'+autor+'.*'};
            }

            if (categoria){
                query.categoria = categoria;
            }

            //console.log(query);

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

        async getSolicitudes(obj){
            const solicitudes = await Solicitud.find();
            return solicitudes.populate('libro');
        },

        async getSolicitud(obj, { id }){
            const solicitud = await Solicitud.findById(id);
            return solicitud.populate('libro').populate('usuario');
        },

        async getSolicitudEstado(obj, { estado_solicitud }){
            var query = {
                "estado_solicitud": estado_solicitud
            }
            const solicitudes = await Solicitud.find(query).sort({createdAt: -1});
            return solicitudes.populate('libro');
        },

        async getUsuarios(obj){
            const usuarios = await Usuario.find();
            return usuarios;
        },

        async getUsuario(obj, { id }){
            const usuario = await Usuario.findById(id).populate('prestamos').populate('solicitudes');
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

        async getComprobante(obj, {fecha_prestamo}){
            const comprobante = await Prestamo.find({fecha_prestamo: fecha_prestamo}).populate('ejemplar');
            return comprobante;
        },

        //Colocar diferencia
        async getPrestamosVencidos(obj, {lugar}){
            var unit = "day"
            var unidad = "dias"
            if (lugar === "Sala"){
                unit = "hour"
                unidad = "horas"
            }
            var date = new Date();
            //const prestamos = await Prestamo.find({lugar: lugar, fecha_devolucion: {$lt: date}}).sort({fecha_devolucion: 'asc'}).populate('ejemplar');
            const prestamos = await Prestamo.aggregate([{
                "$match": {lugar: lugar, fecha_devolucion: {$lt: date}}
              },
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
                    unit: unidad
                }}])
            console.log(prestamos);
            return prestamos;
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
            if(libro !== null){
                const ejemplar = new Ejemplar({estado: 'Disponible', ubicacion: ubicacion, libro: libroFind._id})

                //Agregar referencia al libro
                libroFind.ejemplares.push(ejemplar._id);
                await libroFind.save();

                await ejemplar.save();
                return ejemplar; //Agregar .populate('libro') si queremos mostrar datos del libro 
            }
        },

        async addSolicitud(obj, {input}){
            let {id_libro, id_usuario, fecha_reserva} = input;
            console.log(id_libro);
            let libroFind = await Libro.findById(id_libro);
            let usuarioFind = await Usuario.findById(id_usuario);
            if(id_libro !== null){
                const solicitud = new Solicitud({estado_solicitud: false, fecha_reserva: fecha_reserva, libro: libroFind._id})

                //Agregar referencia al libro
                libroFind.solicitudes.push(solicitud._id);
                await libroFind.save();

                //Agregar referencia a usuario
                usuarioFind.solicitudes.push(solicitud._id);
                await usuarioFind.save();

                await solicitud.save();

                return solicitud;
            }
        },

        async addPrestamo(obj, {input}){
            let {lugar, ejemplar, usuario, bibliotecario} = input;
            let ejemplarFind = await Ejemplar.findById(ejemplar);
            let usuarioFind = await Usuario.findById(usuario);
            let bibliotecarioFind = await Bibliotecario.findById(bibliotecario);

            let fecha_prestamo = new Date();
            let fecha_devolucion = new Date(fecha_prestamo.getTime());
           
            let libroFind = await Libro.findById(ejemplarFind.libro);

            let tipo = libroFind.tipo;

            if(tipo === 'Libro'){
                if (lugar === 'Casa'){
                    fecha_devolucion.setDate(fecha_prestamo.getDate() + 15);
                }

                if (lugar === 'Sala Lectura'){
                    let tiempoMillis = 5 * 60 * 60 * 1000; 
                    fecha_devolucion.setTime(fecha_prestamo.getTime()+tiempoMillis);
                }
            }

            if(tipo == 'Multimedia'){
                if (lugar == 'Casa'){
                    fecha_devolucion.setDate(fecha_prestamo.getDate() + 7)
                }
                
                else if (lugar === 'Sala Multimedia'){
                    let tiempoMillis = 3 * 60 * 60 * 1000; 
                    fecha_devolucion.setTime(fecha_prestamo.getTime() + tiempoMillis)
                }
            }

            console.log(usuarioFind);
            if(ejemplar !== null){
                const prestamo = new Prestamo({fecha_prestamo: fecha_prestamo, fecha_devolucion: fecha_devolucion, lugar: lugar, ejemplar: ejemplarFind._id, usuario: usuarioFind._id, bibliotecario: bibliotecarioFind._id})

                //Agregar referencia al libro
                await ejemplarFind.updateOne({prestamo: prestamo._id, estado: lugar});

                //Agregar referencia a usuario
                usuarioFind.prestamos.push(prestamo._id);
                await usuarioFind.save();

                //Agregar referencia a bibliotecario
                bibliotecarioFind.prestamos.push(prestamo._id);
                await bibliotecarioFind.save();

                await prestamo.save();

                return prestamo;
            }
        },

        async addUsuario(obj, {input}){
            let {rut, nombre, apellido, direccion, telefono, correo, contrasenia, foto, huella} = input;
            const usuario = new Usuario({rut: rut, nombre: nombre, apellido: apellido, direccion: direccion, telefono: telefono, correo: correo, contrasenia: contrasenia, foto: foto, huella: huella, activo: false});
            await usuario.save();
            return usuario;
        },

        async addBibliotecario(obj, {input}){
            let {rut, nombre, apellido, correo, contrasenia, foto} = input;
            const bibliotecario = new Bibliotecario({rut: rut, nombre: nombre, apellido: apellido, correo: correo, contrasenia: contrasenia, foto: foto, activo: true});
            await bibliotecario.save();
            return bibliotecario
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
            let {estado_solicitud, ejemplar} = input;

            const ejemplarFind = await Ejemplar.findById(ejemplar._id);
            const solicitud = await Solicitud.findByIdAndUpdate(id, {estado_solicitud: estado_solicitud, ejemplar: ejemplarFind._id}, {new: true});
            await ejemplarFind.updateOne({estado: 'Reservado'});
            return solicitud;
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
            libroFind.ejemplares.pop(ejemplar._id);
            await libroFind.save();

            //Eliminar ejemplar
            await Ejemplar.deleteOne(ejemplar);
            return {
                message: "Ejemplar eliminado"
            }
        },

        async deleteSolicitud(obj, { id }){
            const solicitud = await Solicitud.findById(id);
            const libroFind = await Solicitud.findById(solicitud.libro);
            const usuarioFind = await Usuario.findById(solicitud.usuario);

            usuarioFind.solicitudes.pop(solicitud._id);
            libroFind.solicitudes.pop(solicitud._id);

            await usuarioFind.save();
            await libroFind.save();

            
            await Solicitud.deleteOne(solicitud);

            
            return {
                message: "Solicitud eliminada"
            }
        },

        async deletePrestamo(obj, { id}){
            const prestamo = await Prestamo.findById(id);
            const ejemplarFind = await Ejemplar.findById(prestamo.ejemplar);
            const usuarioFind = await Usuario.findById(prestamo.usuario);
            const bibliotecarioFind = await Bibliotecario.findById(prestamo.bibliotecario);

            usuarioFind.prestamos.pop(prestamo._id);
            bibliotecarioFind.prestamos.pop(prestamo._id);

            await usuarioFind.save();
            await bibliotecarioFind.save();
            await ejemplarFind.updateOne({prestamo: null});
            
            
            await Prestamo.deleteOne(prestamo);
            
            return {
                message: "Prestamo eliminado"
            }
        },

        async deleteUsuario(obj, { id }){
            const usuario = await Usuario.findById(id);
            //const prestamosFind = await Prestamo.findById(usuario.prestamos);
            //const solicitudesFind = await Solicitud.findById(usuario.solicitudes);
            //console.log(prestamosFind);
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
        },

        async deleteBibliotecario(obj, { id }){
            const bibliotecario = await Bibliotecario.findById(id);
    
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