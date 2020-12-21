'use strict'

// Cargar librerias

    var express = require('express');
    var bodyParser = require('body-parser');


// Ejecutar Expreess

    var app = express();
        // Activa el Framework



// Cargas archivos de Rutas

    var user_routes = require('./routes/user');
    var topic_routes = require('./routes/topic');
    var comment_routes = require('./routes/comment');


// Cargar Midleware

    app.use(bodyParser.urlencoded({extended:false}));
        // Configuracion para parsear datos

    app.use(bodyParser.json())
    // Convierte la peticion a un Object JSON


// Configurar CORs, para acceso cruzado entre dominios

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
    

// Reescribir Rutas

    /*
    app.get('/', (request, response)=>{
         // Tiene dos funciones de Callback 
         // La request es lo que envio 
         // Response es lo que devuelve

         return response.status(200).send({
             messague: "Hola Marte desde el back-end con NODE",
             nombre: "Alexnder Nova"
         });
    });*/

    app.use('/api',user_routes);
    app.use('/api',topic_routes);
    app.use('/api',comment_routes);
    // Añade la palabra /api antes de routes


// Exportar el modulo

    module.exports = app;
