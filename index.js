'use strict'
// Usar modo estricto para buenas practica
// ayuda al codigo

var mongoose = require('mongoose');
// Cargar libreria de Mongoose

var app = require('./app');
// Cargo la configuracion de Express
var port = process.env.PORT || 3999;
// Elijo un puerto, el que esta en proceso O 3999


mongoose.Promise = global.Promise;
// Le digo a moongose que utlize promesas
mongoose.set('useFindAndModify', false);

mongoose.connect('mongodb://localhost:27017/api-rest-node', {useNewUrlParser: true})
        .then(()=>{
            
            console.log('La connexion a MOnGODB well DONE');

            // Crear el Servidor
            app.listen(port, ()=>
            {
                console.log("The Server http://localhost:3999 esta funcionando");
                console.log(" ");
                console.log(" ");
            });

        }).catch(error=> console.log("Aui error", error));