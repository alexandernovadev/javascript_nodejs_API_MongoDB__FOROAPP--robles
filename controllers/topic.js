'use strict'

var Topic = require('../models/topic');
var validator = require('validator');

var controller = 
{
    test: function(request, response)
    {
        return response.status(200).send({
            messague: 'Controlller topic funcionando'
        });
    },

    save: function(request, response)
    {

        // Recoger los parametros por Post
            var params = request.body;
            // Esto lo convierte a JSON por el metodo de bodyParse app.js

        // Validar los datos
            try 
            {
                var validate_title = !validator.isEmpty(params.title);
                var validate_content = !validator.isEmpty(params.content);
                var validate_lang = !validator.isEmpty(params.lang);
            }
            catch
            {
                return response.status(200).send({
                    messague: 'Faltan datos por Enviar'
                });
            }

        if(validate_title && validate_content && validate_lang)
        {
            // Crear el objeto a Guardar
                var topic = new Topic();
            
            // Asignar valores
                topic.title = params.title;
                topic.content = params.content;
                topic.code = params.code;
                topic.lang = params.lang;
                topic.user = request.user.sub;

            // Guardar valores
                topic.save((err, topicStored)=>{

                    // Devolver una respuesta
                    if(err || !topicStored)
                    {
                        return response.status(400).send({
                            status: 'error',
                            messague: 'Error al save Topic'
                        });
                    }
                    return response.status(200).send({
                        status: 'success',
                        messague: 'Topic Guardada',
                        topicStored
                    });
                });
            
        }
        else
        {   
            return response.status(201).send({
                status: 'error',
                messague: 'Los datos no son Validos'
            });
        }
    },
    
    getTopics: function(request, response)
    {
        // Cargar la libreria de paginacion en la clase
            // Esto esta en el modelo de topics

        // Recoger la pagina actual
        var page = parseInt(request.params.page);
        if(page == null || page == undefined || page == 0 || page == '0')
        {
            page = 1;
        }
        // Indicar las opciones de paginacion 

            // Si en sort date coloco 1 => Ordena de mas viejo a mas nuevo (asc)
            // Si en sort date coloco -1 => Ordena de mas nuevo a mas  viejo (des)

            //Populate: Trae todo lo relacionado al id del usuario
            // Pues yo coloque user, asi que trae users
         var options = {
            sort: {date: -1 },
            populate: 'user',
            limit: 5,
            page: page
         };

        // Find paginado 

            Topic.paginate({}, options, (err, topics)=>
            {    

                if(err)
                {
                    return response.status(500).send({
                        messague: 'Error con el servidor',
                        type: 'Error con la Paginacion'
                    });
                }
                
                if(!topics)
                {
                    return response.status(404).send({
                        messague: 'No hay Topics',
                        status: 'notFound'
                    });
                }
               
                    return response.status(200).send({
                        status: 'success',
                        topics: topics.docs,
                        totalDocs: topics.totalDocs,
                        totalpages: topics.totalPages
                    });
            
                // Devolver resultado (topics, totalTopics, TotalPages)
            });

    },

    getTopicsByUser: function(request, response)
    {

        // Conseguir el Id del usser
        var userId = request.params.user;

        // Hacer un Find con la condicion de Usario(comprobar topics de User)

        Topic.find({user: userId})
             .sort([['date', 'descending']])
             .exec( (err, TopicsUser)=>{
                if(err)
                {
                    return response.status(500).send({
                        messague: 'Error con el servidor',
                        type: 'Erro al sacer topics de User'
                    });
                }
                
                if(!TopicsUser)
                {
                    return response.status(404).send({
                        status: 'error',
                        messague: 'No hay Topics'
                    });
                }

                // Devolver un resultado

                return response.status(200).send({
                    status: 'success',
                    TopicsUser
                });
            });

    },

    getTopic: function(request, response)
    {
        var id = request.params.id;

        Topic.findById(id, (err, Topic)=>{
            if(err)
            {
                return response.status(500).send({
                    status: 'error',
                    messague: 'Error con el servidor',
                    type: 'Erro al sacar el TOPIC'
                });
            }
            
            if(Topic)
            {
                return response.status(200).send({
                    status: 'success',
                    messague: 'Topic Encontrado',
                    topic: Topic
                });
            }
            else
            {
                return response.status(404).send({
                    status: 'error',
                    messague: 'El Topics no existe'
                });
            }

        }).populate('user')
        .populate('comments.user');
    },

    update: function(request, response)
    {   
        // Recoger de id del  Topic por Url
        var idTopic = request.params.id;

        // Recoger datos que llegan por Post
        var params = request.body;

        //Recoger id de usuario
        var userID = request.user.sub;

        // Validar los datos
        try 
        {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        }
        catch
        {
            return response.status(200).send({
                status: 'error',
                messague: 'Faltan datos por Enviar'
            });
        }
    

        if(validate_title && validate_content && validate_lang)
        {

            // Mostrar un Json con los datos Modificables
            var topicUpdate = {
            title: params.title,
            content: params.content,
            code: params.code,
            lang: params.lang,
             }   
            
            // Find  and Update por id topic e id User

            // console.log(request.user.name);
            // console.log(request.user.sub);
            
            Topic.findOne({_id: idTopic, user: userID}).exec((err, user)=>{
                if(user)
                {
                    //console.log("User iguales");
                    Topic.findByIdAndUpdate({_id: idTopic}, topicUpdate ,{new: true} ,(err, TopicsUpdate)=>{
                        if(err)
                        {
                            return response.status(500).send({
                                status: 'error',
                                messague: 'Error con el servidor',
                                type: 'Erro al Update el TOPIC'
                            });
                        }
                        
                        if(TopicsUpdate)
                        {
                            // Devolver una Respuseta
                            return response.status(201).send({
                                status: 'success',
                                messague: 'Topics Actualizado',
                                TopicsUpdate
                            });
                        } 
                    }).populate('user');   
                    
                }
                else
                {
                    //console.log("No son oiguales");
                    return response.status(400).send({
                        status: 'error',
                        messague: 'No eres el dueño del Post'
                    });
                }
            });

        }
        else
        {
            return response.status(200).send({
                status: 'error',
                messague: 'Datos No Validos',
            });
        }
    },

    delete: function(request, response)
    {
        // Capturar Id del Topics
        var topicID = request.params.id;
        // Id del usuario
        var userID = request.user.sub;

        Topic.findOne({_id: topicID, user: userID}).exec((err, user)=>{
            if(user)
            {
                //console.log("User iguales");
                Topic.findByIdAndDelete({_id: topicID}, (err,topicDelete)=>{
                    if(err)
                    {
                        return response.status(500).send({
                            status: 'error',
                            messague: 'Error con el servidor',
                            type: 'Erro al borrar el TOPIC'
                        });
                    }
        
                    if(topicDelete)
                    {
                        return response.status(200).send({
                            status: 'success',
                            messague: 'Topic borrado',
                            topicDelete
                        });
                    }
                    else
                    {
                        return response.status(200).send({
                            status: 'error',
                            messague: 'El topic no Existe',
                        });
                    }
                });
                
            }
            else
            {
                //console.log("No son oiguales");
                return response.status(400).send({
                    status: 'error',
                    messague: 'No eres el dueño del Post'
                });
            }
        });
    },

    search: function(request, response)
    {
        // Recoger parametro de busqueda
        var palabra = request.params.search;

        // Find con un operador OR
            // Va a hacer una busque que cumpla una condicion O
            // otra condicion O otra condicion ......

            // $options i es caso sensitivo acepta lowercase o UpperCase
        Topic.find({"$or":[
            {'title': {'$regex': palabra, '$options': 'i'} },
            {'content': {'$regex': palabra, '$options': 'i'} },
            {'code': {'$regex': palabra, '$options': 'i'} },
            {'lang': {'$regex': palabra, '$options': 'i'} },
        ]})
        .populate('user')
        .sort([['date', 'descending']])
        .exec((err, topics)=>{
            if(err)
            {
                return response.status(500).send({
                    messague: 'Error con el servidor',
                    type: 'Erro al buscar el TOPIC'
                });
            }

            // Devolver un reslutado
            return response.status(200).send({
                messague: 'Topics encontrados',
                topics
            });
        });
    }
};

module.exports = controller;