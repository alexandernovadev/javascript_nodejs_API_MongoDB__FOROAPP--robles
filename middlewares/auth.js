'use strict'

var jwt = require('jwt-simple');
var  momment = require('moment');
var key = 'clave-secret';


exports.auth = function (request, response, next)
{
    // Los middleware tiene siempre tres parametros
    // Que son los tres de arriba

    // console.log("Estas por el middleare");

    // console.log("TEST", request);

    // Comprobar si llega la cabecera de Autirizacion
    if(!request.headers.authorization)
    {
        return response.status(200).send({
            messague: 'El usuario no esta autenticado'
        });
    }
    else
    {
        // Limpiar el token y quitar comillas

        var cleanToken = request.headers.authorization.replace(/['"]+/g, '');
        // Busque las comillas simples o dobles las veces que las encuentre
        // remplacelo por nada

        // Decodificar el Token
            // Procesos que generar a veces errorer then utilizamos try catch

            // console.log(momment().get('date'));
            //console.log(payload);
            
            try 
            {
                var payload = jwt.decode(cleanToken, key);
                      // Comprobar expiracion
                if(momment() > momment(payload.exp))
                {
                    //console.log("Expiroo");
                    return response.status(401).send({
                        messague: "El token ha expirado"
                    });
                }
                else
                {
                    //console.log("No ha expirado");

                    // Adjuntar el usuario Identificado a la Request
                    request.user = payload;
                    // Para acceder a los datos de usuario siempre 


                    // Pasar a la accion next()
                    next(); 
                    // Si todo sale bien, siga adelante
                }
            }
            catch (error)
            {
                return response.status(404).send({
                    messague: 'Token No valido'
                });
            }
    }

};