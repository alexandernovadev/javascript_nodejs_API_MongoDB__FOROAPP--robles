'use strict'

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;
// Modeo de Comentarios

var CommentsShema = Schema({
    content: String,
    date: {type: Date, default: Date.now},
    user: {type: Schema.ObjectId, ref: 'User'},
});

var Comment = mongoose.model('Comment', CommentsShema);

// Modelo de Topic
var TopicSchema = Schema ({
    title: String,
    content: String,
    code: String,
    lang: String,
    date: {type: Date, default: Date.now},
    user: {type: Schema.ObjectId, ref: 'User'},
    comments: [CommentsShema]
});

// Cargar paginacion
TopicSchema.plugin(mongoosePaginate);

module.exports  = mongoose.model('Topic', TopicSchema);
