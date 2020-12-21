'use strict'

var jwt = require('jwt-simple');

// Utiliza momments.js para calcular la fecha de caducacion del token
var  momment = require('moment');

exports.createtoken = function(user)
{
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: momment(),
        exp: momment().add(1, 'days')
    };
    // Todos los datos de usuario  

    return jwt.encode(payload, 'clave-secret');
}