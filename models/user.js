'use strict'

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// Traigo los esquemas de Moongose

// Aqui creo el esquema
var userSchema = Schema ({
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String
});

// Borrar el dato password cuando se llama este modelo

userSchema.methods.toJSON = function ()
{
    var obj = this.toObject();

    delete obj.password;

    return obj; 
};

module.exports  = mongoose.model('User', userSchema);
// Esto es como un objeto
// Hace un lowecase y pluraliza el name

// users-> doucmentos 