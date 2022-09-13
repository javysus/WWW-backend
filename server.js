const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");


//const {graphqlExpress, graphiqlExpress} = require("graphql-server-express");
//const {makeExecutableSchema} = require("graphql-tools");

const {ApolloServer, gql} = require("apollo-server-express");


const{merge, filter} = require("lodash");

const{GraphQLDateTime} = require("graphql-iso-date");

const Ejemplar = require('./models/ejemplar');
const Libro = require('./models/libro');
const Solicitud = require('./models/solicitud');
const Prestamo = require('./models/prestamo');
const Usuario = require('./models/usuario');

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
    createdAt: Date
    updatedAt: Date
    estado_solicitud: Boolean
    libro: Libro!
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
}

type Usuario{
    id: ID!
    rut: String!
    nombre: String!
    direccion: String!
    telefono: Int!
    correo: String!
    contrasenia: String
    activo: Boolean!
    foto: String
    huella: [Boolean]
    prestamos: [Prestamo]
    solicitudes: [Solicitud]
}

input UsuarioInput{
    rut: String!
    nombre: String!
    direccion: String!
    telefono: Int!
    correo: String!
    contrasenia: String!
    activo: Boolean!
    foto: String
    huella: [Boolean]
}

input UsuarioActualizar{
    rut: String
    nombre: String
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
    estado: String!
    ubicacion: String
    libro: String
}

input SolicitudInput{
    id_libro: String!
    id_usuario: String!
}

input SolicitudActualizar{
    estado_solicitud: Boolean
}

input PrestamoInput{
    fecha_prestamo: Date!
    fecha_devolucion: Date!
    lugar: String!
    ejemplar: String!
    usuario: String!
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
}

type Mutation {
    addLibro(input: LibroInput): Libro
    updateLibro(id: ID!, input: LibroActualizar): Libro
    deleteLibro(id: ID!): Alert
    addEjemplar(input: EjemplarInput): Ejemplar
    updateEjemplar(id: ID!, input: EjemplarInput): Ejemplar
    deleteEjemplar(id: ID!): Alert
    addSolicitud(input: SolicitudInput): Solicitud
    updateSolicitud(id: ID!, input: SolicitudActualizar): Solicitud
    deleteSolicitud(id: ID!): Alert
    addPrestamo(input: PrestamoInput): Prestamo
    updatePrestamo(id: ID!, input: PrestamoActualizar): Prestamo
    deletePrestamo(id: ID!): Alert
    addUsuario(input: UsuarioInput): Usuario
    updateUsuario(id: ID!, input: UsuarioActualizar): Usuario
    deleteUsuario(id: ID!): Alert
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
            return solicitudes;
        },

        async getSolicitud(obj, { id }){
            const solicitud = await Solicitud.findById(id);
            return solicitud;
        },

        async getSolicitudEstado(obj, { estado_solicitud }){
            var query = {
                "estado_solicitud": estado_solicitud
            }
            const solicitudes = await Solicitud.find(query);
            return solicitudes;
        },

        async getUsuarios(obj){
            const usuarios = await Usuario.find();
            return usuarios;
        },

        async getUsuario(obj, { id }){
            const usuario = await Usuario.findById(id).populate('prestamos').populate('solicitudes');
            return usuario;
        },
    },

    Mutation: {
        async addLibro(obj, { input }){
            const libro = new Libro(input);
            await libro.save();
            return libro;
        },

        async addEjemplar(obj, { input }){
            let {estado, ubicacion, libro} = input;
            let libroFind = await Libro.findById(libro);
            if(libro !== null){
                const ejemplar = new Ejemplar({estado: estado, ubicacion: ubicacion, libro: libroFind._id})
                await ejemplar.save();

                //Agregar referencia al libro
                libroFind.ejemplares.push(ejemplar._id);
                await libroFind.save();
                return ejemplar; //Agregar .populate('libro') si queremos mostrar datos del libro 
            }
        },

        async addSolicitud(obj, {input}){
            let {id_libro, id_usuario} = input;
            console.log(id_libro);
            let libroFind = await Libro.findById(id_libro);
            let usuarioFind = await Usuario.findById(id_usuario);
            if(id_libro !== null){
                const solicitud = new Solicitud({estado_solicitud: false, libro: libroFind._id})

                await solicitud.save();

                //Agregar referencia al libro
                libroFind.solicitudes.push(solicitud._id);
                await libroFind.save();

                //Agregar referencia a usuario
                usuarioFind.solicitudes.push(solicitud._id);
                await usuarioFind.save();

                return solicitud;
            }
        },

        async addPrestamo(obj, {input}){
            let {fecha_prestamo, fecha_devolucion, lugar, ejemplar, usuario} = input;
            let ejemplarFind = await Ejemplar.findById(ejemplar);
            let usuarioFind = await Usuario.findById(usuario);

            if(ejemplar !== null){
                const prestamo = new Prestamo({fecha_prestamo: fecha_prestamo, fecha_devolucion: fecha_devolucion, lugar: lugar, ejemplar: ejemplarFind._id, usuario: usuarioFind._id})

                await prestamo.save();

                //Agregar referencia al libro
                await ejemplarFind.updateOne({prestamo: prestamo._id});

                //Agregar referencia a usuario
                usuarioFind.prestamos.push(prestamo._id);
                await usuarioFind.save();

                return prestamo;
            }
        },

        async addUsuario(obj, {input}){
            const usuario = new Usuario(input);
            await usuario.save();
            return usuario;
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
            const solicitud = await Solicitud.findByIdAndUpdate(id, input, {new: true});
            return solicitud;
        },

        //Asumimos que no se puede extender el plazo del prestamo
        async updatePrestamo(obj, {id, input}){
            const prestamo = await Prestamo.findByIdAndUpdate(id, input, {new: true});

            //Liberar ejemplar
            const ejemplar = await Ejemplar.findById(prestamo.ejemplar);
            await ejemplar.updateOne({prestamo: null});

            return prestamo;
        },
        
        async updateUsuario(obj, { id, input }){
            const usuario = await Usuario.findByIdAndUpdate(id, input,{new: true});
            return usuario;
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
            //Eliminar ejemplar
            await Ejemplar.deleteOne(ejemplar);

            //Eliminar ejemplar del libro
            libroFind.ejemplares.pop(ejemplar._id);
            await libroFind.save();
            return {
                message: "Ejemplar eliminado"
            }
        },

        async deleteSolicitud(obj, { id }){
            const solicitud = await Solicitud.findById(id);
            const libroFind = await Solicitud.findById(solicitud.libro);
            const usuarioFind = await Usuario.findById(solicitud.usuario);

            await Solicitud.deleteOne(solicitud);

            usuarioFind.solicitudes.pop(solicitud._id);
            libroFind.solicitudes.pop(solicitud._id);

            await usuarioFind.save();
            await libroFind.save();
            
            return {
                message: "Solicitud eliminada"
            }
        },

        async deletePrestamo(obj, { id}){
            const prestamo = await Prestamo.findById(id);
            const ejemplarFind = await Ejemplar.findById(prestamo.ejemplar);
            const usuarioFind = await Usuario.findById(prestamo.usuario);

            await Prestamo.deleteOne(prestamo);
            await ejemplarFind.updateOne({prestamo: null});
            usuarioFind.prestamos.pop(prestamo._id);
            await usuarioFind.save();
            
            return {
                message: "Prestamo eliminado"
            }
        },

        async deleteUsuario(obj, { id }){
            await Usuario.deleteOne({_id: id});
            return {
                message: "Solicitud eliminada"
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