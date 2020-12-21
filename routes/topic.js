'use strict'

var express = require('express');
var TopicController = require('../controllers/topic');
var router = express.Router();
var md_auth = require('../middlewares/auth');



router.get('/test', TopicController.test);  

// Guardar Topic
router.post('/topic', md_auth.auth, TopicController.save);  


// Listar Topics con Paginador WUAAAAU
router.get('/topics/:page?', TopicController.getTopics);  

// Listar los Topics por User
router.get('/user-topics/:user?', TopicController.getTopicsByUser);

router.get('/topic/:id', TopicController.getTopic);


router.put('/update/:id', md_auth.auth, TopicController.update);

router.delete('/delete/:id', md_auth.auth, TopicController.delete);

router.get('/search/:search', TopicController.search);


module.exports = router;