const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");


//const {graphqlExpress, graphiqlExpress} = require("graphql-server-express");
//const {makeExecutableSchema} = require("graphql-tools");

const {ApolloServer, gql} = require("apollo-server-express");


const{merge, filter} = require("lodash");

const Ejemplar = require('./models/ejemplar');
const Libro = require('./models/libro');

mongoose.connect('mongodb+srv://chocolovers:2605@clusterwww.frnk98m.mongodb.net/bec', {useNewUrlParser: true, useUnifiedTopology: true})

const typeDefs = gql`
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
}

type Ejemplar{
    id: ID!
    estado: String!
    ubicacion: String
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
type Alert{
    message: String
}

type Query {
    getLibros: [Libro]
    getLibro(id: ID!): Libro 
    getLibrosCatalogo(titulo: String, autor: String, categoria: String): [Libro]
    getEjemplares: [Ejemplar]
    getEjemplar(id: ID!): Ejemplar
}

type Mutation {
    addLibro(input: LibroInput): Libro
    updateLibro(id: ID!, input: LibroInput): Libro
    deleteLibro(id: ID!): Alert
    addEjemplar(input: EjemplarInput): Ejemplar
    updateEjemplar(id: ID!, input: EjemplarInput): Ejemplar
    deleteEjemplar(id: ID!): Alert
}`;

const resolvers = {
    Query: {
        async getLibros(obj){
            const libros = await Libro.find().populate('ejemplares');
            return libros;
        },

        async getLibro(obj, { id }){
            const libro = await Libro.findById(id);
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

            console.log(query);

            let libros_dos = await Libro.aggregate([
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
                    "titulo": {
                      "$first": "$titulo"
                    },
                    "autor": {
                      "$first": "$autor"
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
            const libros = await Libro.find(query).populate('ejemplares');

            //console.log(libros);
            for (let libro in libros) {
                console.log("libros largo: " , libros.length)
                let disponibles = 0
                //console.log(libros[libro].ejemplares[libro].estado)
                for (let ejemplar in libros[libro].ejemplares){
                    if (libros[libro].ejemplares[ejemplar].estado == "Disponible"){
                        disponibles = disponibles + 1
                    }
                }
                console.log("Libros disponibles: ", disponibles)
            }
            //const count = await libros.ejemplares.find({"ejemplares.estado": "Disponible"});
            //const ejemplares = await libros.find({"ejemplares.estado": "Disponible"});

            
            return libros_dos;
        },

        async getEjemplar(obj, { id }){
            const ejemplar = await Ejemplar.findById(id);
            return ejemplar;
        },

        async getEjemplares(obj){
            const ejemplares = await Ejemplar.find().populate('libro');
            return ejemplares;
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

        async updateLibro(obj, { id, input }){
            const libro = await Libro.findByIdAndUpdate(id, input);
            return libro;
        },

        async updateEjemplar(obj, { id, input }){
            const ejemplar = await Ejemplar.findByIdAndUpdate(id, input);
            return ejemplar;
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