'use strict'

var Topic = require('../models/topic');
var validator = require('validator');

var controller = 
{
    add: function(request, response)
    {
        // Recoger el Id del topics de URL
        var topicID = request.params.id

        // Recoger contenido de User
        try 
        {
            var contentComment = request.body.content;

            var validate_content = !validator.isEmpty(contentComment);    
        } 
        catch (error)
        {
            return response.status(400).send({
                status: 'error',
                messague: 'No se envieron datos'
            });
        }
        

        if(validate_content)
        {

            // Find de ID dell topic
            
            Topic.findById(topicID, (err, TopicsUser)=>{
                if(err)
                {
                    return response.status(500).send({
                        status: 'error',
                        messague: 'Error con el servidor',
                        type: 'Error al buscar topics'
                    });
                }
                
                if(TopicsUser)
                {
                    
                    // Sacar ID del usuario
                    
                    var userID = request.user.sub;
                    
                    // En la propiedad comments de objeto hacer un push
                    
                    //sconsole.log("IDuser",userID);
                    
                    var comment = 
                    {
                        content: contentComment,
                        user: userID
                    }
                    
                    TopicsUser.comments.push(comment);
                    //console.log("Topics User" , TopicsUser);
                    
                   
                    // Save guardar el topic completo
                    TopicsUser.save((err)=>{
                        if(err)
                        {
                            return response.status(500).send({
                                status: 'error',
                                messague: 'Error con el servidor',
                                type: 'Error al buscar topics'
                            });
                        }
                        Topic.findById(topicID, (err, Topic)=>{
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

                     
                    });
                }
            });
        }
        else
        {
            return response.status(200).send({
                status: 'error',
                messague: 'Datos no validos'
            });
        }

    },                                               

    update: function(request, response)
    {
        // Recoger id de Comment 
        var commentID = request.params.commentId;

        // Validar datos
        var contentComment = request.body.content;

        try 
        {
            var validate_content = !validator.isEmpty(contentComment);    
        } 
        catch (error)
        {
            return response.status(400).send({
                status: 'error',
                messague: 'No se envieron datos'
            });
        }
        
        
        if(validate_content)
        {   
            Topic.findOneAndUpdate({'comments._id': commentID},
            {  $set:
                {
                    'comments.$.content': contentComment,
                }
            },
            {new: true},
            (err, res)=>{
                if(err)
                {
                    return response.status(200).send({
                        status: 'error',
                        message : 'error al buscar'
                    });
                }
                if(res)
                {
                    return response.status(200).send({
                        status: 'success',
                        message : 'Commentario Actualizado',
                        res
                    });
                }
            });
        }
        else
        {
            return response.status(200).send({
                status: 'error',
                message: 'Datos no validos'
            });
        }

    },                                               

    delete: function(request, response)
    {
        // Recoger id de Comment 
        var commentID = request.params.commentId;
        
        // Recoger id Topics
        var topicID = request.params.topicId;

        // Buscar id Topics

        Topic.findById(topicID,(err, TopicFound)=>{
            if(err)
            {
                return response.status(500).send({
                    status: 'error',
                    message: 'El topics no existe'
                });
            }
            if(TopicFound)
            {
                var comment = TopicFound.comments.id(commentID);

                if(comment)
                {
                    comment.remove();

                    TopicFound.save((err)=>{
                        if(err)
                        {
                            return response.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar delete de comentario'
                            });
                        }

                        Topic.findById(topicID, (err, Topic)=>{
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
                                    messague: 'Topic Booradp',
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

                    });
                  
                }
                else
                {
                    return response.status(404).send({
                        status: 'error',
                        message: 'El topics NO EXISTE',
                    });
                }

            }
        });

        // Borrar id Topic

    }                                               
}

module.exports = controller;