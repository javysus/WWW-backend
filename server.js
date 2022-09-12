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
const Solicitud = require('./models/solicitud')

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
    libro: Libro
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
    libro: Libro
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

input EjemplarInput{
    estado: String!
    ubicacion: String
    libro: String
}

input SolicitudInput{
    id_libro: String
}

input SolicitudActualizar{
    estado_solicitud: Boolean
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
}

type Mutation {
    addLibro(input: LibroInput): Libro
    updateLibro(id: ID!, input: LibroInput): Libro
    deleteLibro(id: ID!): Alert
    addEjemplar(input: EjemplarInput): Ejemplar
    updateEjemplar(id: ID!, input: EjemplarInput): Ejemplar
    deleteEjemplar(id: ID!): Alert
    addSolicitud(input: SolicitudInput): Solicitud
    updateSolicitud(id: ID!, input: SolicitudActualizar): Solicitud
    deleteSolicitud(id: ID!): Alert
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
        }
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
            let {id_libro} = input;
            console.log(id_libro);
            let libroFind = await Libro.findById(id_libro);
            if(id_libro !== null){
                const solicitud = new Solicitud({estado_solicitud: false, libro: libroFind._id})

                await solicitud.save();

                //Agregar referencia al libro
                libroFind.solicitudes.push(solicitud._id);
                await libroFind.save();
                return solicitud;
            }
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

        async deleteLibro(obj, { id }){
            await Libro.deleteOne({_id: id});
            return {
                message: "Libro eliminado"
            }
        },

        async deleteEjemplar(obj, { id }){
            await Ejemplar.deleteOne({_id: id});
            return {
                message: "Ejemplar eliminado"
            }
        },

        async deleteSolicitud(obj, { id }){
            await Solicitud.deleteOne({_id: id});
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