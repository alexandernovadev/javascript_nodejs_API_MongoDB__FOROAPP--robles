'use strict'

// Librerias
var validator = require('validator');
var User = require('../models/user');
var bcryp = require('bcrypt');
var jwt = require('../services/jwt');
// Esta libreria me permite trabajar con ficheros

var fs = require('fs');
var path = require('path');

// Como una clase

var controller = 
{
    probando: function(request, response)
    {
        return response.status(200).send({
            message: "Soy el metodo probando"
        });
    },

    testeando: function(request, response)
    {
        return response.status(200).send({
            message: "Soy el metodo testeando"
        });
    },

    save: function(request, response){
        // Recojer los parametros de la peticion
        var params = request.body;

        // Validar los datos
        try
        {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }
        catch(error)
        {
            return response.status(400).send({
                messague: "No se ha enviado dato/s"
            });
        }
        
        // console.log(validate_name,
        //     validate_surname,
        //     validate_email,
        //     validate_password);

        if(validate_name && validate_surname && validate_email && validate_password)
        {
            // Crear el objeto de Usuario
            var user = new User();

            // Asignar valores al Objeto
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;

            // Comprobar que usuario existe
            User.findOne({email: user.email}, (error, issetUser) => {
                // Con findOne => Busca un user en MongoDB
                // Ver documentacion
                if(error)
                {
                    return response.status(500).send({
                        message: "Error al comprbar duplicidad del Usario",
                        errorserver : error
                    });
                }

                if(!issetUser)
                {// Si no existe el usuario
                    
                    
                    //cifrar la password
                    bcryp.hash(params.password, 10, (err, hash) =>{
                        user.password = hash;
                        // Cifrar la Password 
                        
                        // Guardar Usuario

                        user.save((err, userStored)=>{
                            if(err)
                            {
                                return response.status(400).send({
                                    status: 'error',
                                    message: "Error al guardar el usuario, SERVER",
                                    errorserver : err
                                });
                            }

                            if(userStored)
                            {
                                return response.status(200).send({
                                    status: 'success',
                                    message: "Usuario Saving Correctamente",
                                    user: userStored
                                });
                            }
                            else
                            {
                                return response.status(400).send({
                                    status: 'error',
                                    message: "Usuario No se ha Guardado",
                                });
                            }
                        });
              
                    });

                }
                else
                {
                    return response.status(200).send({
                        status: 'duplicado',
                        message: "El usuario YA EXISTE"
                    });
                }
            });


        }
        else
        {
            return response.status(400).send({
                message: "La validacion de datos es incorrecta"
            });
        }
        
    },

    login: function(request, response)
    {
        // Recojer los parametros de la peticion
        var params = request.body;

        // Validar los datos

        try
        {
            var validate_password = !validator.isEmpty(params.password);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        }
        catch(error)
        {
            return response.status(400).send({
                messague: "Campos sin rellenar"
            });
        }

        if(!validate_email || !validate_password)
            {
                return response.status(400).send({
                    messague: "No se ha enviado dato/s"
                });
            }
            else
            {
                
                User.findOne({email: params.email.toLowerCase()},(error, issetuser)=>{

                    if(error)
                    {
                        return response.status(500).send({
                            message: "Error Con el Servidor",
                            type: "Buscando Usuario en MongoDB"
                        });
                    }

                    if(issetuser)
                    {

                        // Si lo encuentra
                        
                        // response.status(200).send({
                        //     message: "Usuario Encontrado correctly",
                        //     user: issetuser,
                        //     pass: issetuser.password
                        // });

                        // Comprobar la contraseña
                        // Coincidencia del email y password (ByCryp compare)
                        bcryp.compare(params.password, issetuser.password, function(err, res) {
                            if(err)
                            {
                                return response.status(500).send({
                                    status: 'error',
                                    message: "Error del servidor",
                                    type: "Comparando bcrypt"
                                });
                            }
                            if(res)
                            {
                                // Limpiar el objeto 

                                issetuser.password = undefined;
                                // issetuser.__v = undefined;


                                // Generar token de JWT

                                if (params.getToken)
                                {
                                    return response.status(200).send({
                                        status: 'success',
                                        message: "Token devuelto",
                                        token: jwt.createtoken(issetuser)
                                    });
                                }
                                else
                                {
                                    return response.status(200).send({
                                        status: 'success',
                                        message: "Datos de usuario",
                                        user: issetuser
                                    });
                                }
                                
                            }
                            else
                            {
                                return response.status(201).send({
                                    status: 'error',
                                    message: "La contraseña NOO coincide",
                                });
                            }
                            
                        });
                    }
                    else
                    {
                        return response.status(201).send({
                            status: 'error',
                            message: "Usuario No encontrado"
                        });
                    }

                });
            
            }
            
    },

    update: function (request, response)
    {
        
        // Crear midleware, para comprobar el usuario

        /* AL CRUZAR LA REQUEST POR EL MIDLE SE AÑADE UNA PROPIEDAD LLAMADA USER OJO OJO OJO*/
        // Recoger datos del usuario
        var update_params= request.body;

        // Validar Datos
        try
        {
            var validate_name = !validator.isEmpty(update_params.name);
            var validate_surname = !validator.isEmpty(update_params.surname);
            var validate_email = !validator.isEmpty(update_params.email) && validator
                                           .isEmail(update_params.email);
        }
        catch(error)
        {
            return response.status(400).send({
                messague: "No se ha enviado dato/s"
            });
        }


        // Comprobar si el email ya exisite

        if(request.user.email != update_params.email)
        {

            User.findOne({email: update_params.email}, (err, user)=>{
                if(err)
                {
                    return response.status(500).send({
                        message: 'Error con el servidor',
                        type: 'Search and check emailuser repeat'
                        
                    });
                }
                
                if(user)
                {
                    return response.status(400).send({
                        message: 'El email ya existe',
                        email: user.email
                    });
                }
                else
                {
                    // Eliminar propiedades inncesarias
                    delete update_params.password;

                    // Buscar y actualizar Documento

                    var userId = request.user.sub;
                    // console.log(userId);
                    

                    // User.findOneAndUpdate(condicion, datos a actualizar, opcion, callback)
                    // {new: true} => devuelve los datos ya actualizados ¿, no los viejos 
                    User.findOneAndUpdate({_id: userId}, update_params, {new: true},(err, UserUpdated)=>{
                        if(err)
                        {
                            return response.status(500).send({
                                status: 'error',
                                message: 'Error con el servidor',
                                error: err,
                                type: 'Buscar y Actualizar'
                            });
                        }

                        if(!UserUpdated)
                        {
                            return response.status(400).send({
                                status: 'error',
                                message: 'Error al Actualizar el User'
                            });
                        }

                        return response.status(200).send({
                            status: 'success',
                            UserUpdated
                        });
                    });
                }
                        
            });
        }
        else
        {
            
            // Eliminar propiedades inncesarias
            delete update_params.password;

            // Buscar y actualizar Documento

            var userId = request.user.sub;
            // console.log(userId);
            

            // User.findOneAndUpdate(condicion, datos a actualizar, opcion, callback)
            // {new: true} => devuelve los datos ya actualizados ¿, no los viejos 
            User.findOneAndUpdate({_id: userId}, update_params, {new: true},(err, UserUpdated)=>{
                if(err)
                {
                    return response.status(500).send({
                        message: 'Error con el servidor',
                        error: err,
                        type: 'Buscar y Actualizar'
                    });
                }

                if(!UserUpdated)
                {
                    return response.status(400).send({
                        message: 'Error al Actualizar el User'
                    });
                }

                return response.status(200).send({
                    status: 'Success',
                    UserUpdated
                });
            });
        }    
    },

    uploadAvatar: function (request, response)
    {

        // Configurar el modulo multiparty -> Para subir ficheros
            // Midleware- que esta en routes

        // Recoger el fichero de la peticion

        var file_name = 'Avatar  no subido...';

        //console.log(request.files);
        
        if(!request.files)
        {
            return response.status(404).send({
                status: file_name,
            });
        }
        else
        {
            // Conseguir el nombre y la extension de Archivo subido
                var file_path = request.files.file0.path;
                var file_split = file_path.split('\\');

                //"folderprincipall": "uploads", pos 0
                //"subfolder": "users",          pos 1
                //"nombre_imagen": "imgsd4.jpg"  pos 2

                /* En linux y MAC seria */
                //var file_split = file_path.split('/');


                var file_name = file_split[2];
                var ext_split = file_name.split('\.'); // Escapese solo el punto
                var ext = ext_split[1];

                // Vamos a comprobar extension (solo imagenes)
                if (ext != 'jpg' && ext != 'png' && ext != 'jpeg' && ext != 'gif')
                {
                    fs.unlink(file_path, (error)=>{
                        if(error)
                        {
                            return response.status(500).send({
                                message: 'Error de servidor',
                                type: 'Error al borarr file'
                            });
                        }
                        console.log('Muy fast');
                        
                    });

                    return response.status(400).send({
                        status: 'error',
                        messague: 'El archivo no es una imagen ('+ '.'+ext+')'
                    });
                    // Si no es valido borrar fichero subido
                    
                }
                else
                {
                    // Sacar el ID del usuario identificado

                    var Userid = request.user.sub;
                    // Hacer el Update en MogoDB
                    
                    User.findOneAndUpdate({_id: Userid}, {image: file_name},{new: true},(err, user)=>{
                        // file_name : Name de la imagen que quedo en el servidor
                        // Yo pensaba que era el name original de la img
                        if(err)
                        {
                            return response.status(500).send({
                                message: 'Error servidor',
                                type: 'Erro al update Avatar user Mongo'
                            });
                        }
                        // Devolver una respustes
              
                        return response.status(200).send({
                            status: 'success',
                            messague: 'El archivo se subio',
                            user
                        });
                    });
                    
                }
        }

    },

    avatar: function(request, response)
    {
        var fileName = request.params.filename;
        // Obtiene los parametros y coge la variable filename

        var pathFile = './uploads/users/'+ fileName;
        
        //console.log(pathFile);
        

        fs.exists(pathFile, (exists)=>{
            // Si exisst da true
            // Comprueba si la imagen
            if(exists)
            {
                return response.sendFile(path.resolve(pathFile));
            }
            else
            {
                return response.status(404).send({
                    messague: 'La imagen no existe',
                });
            }
        }); 
    },

    getUsers: function(request, response)
    {
        User.find((err, users)=>{
            if(err)
            {
                return response.status(500).send({
                    status: 'error',
                    message: 'Error con el servidor',
                    type: 'Error al sacar User con MongoDB'
                });
            }
            else
            {
                return response.status(200).send({
                    status: 'success',
                    message: 'usuarios Listados',
                    users
                });
            }
            
        });
    },

    getUser: function(request, response)
    {
        var userId = request.params.id;

        User.findById(userId, (err, user)=>{
       

            if(user)
            {
                return response.status(200).send({
                    status: 'success',
                    message: 'Usuario conseguido',
                    user
                });
            }
            else
            {
                return response.status(404).send({
                    status: 'error',
                    message: 'usuario no encontrado'
                });
            }

           
        });
    }
};

module.exports = controller;

// Crea un OBJETO con funciones como si fuera una especie
// de clase, woooouuuuu severo   

