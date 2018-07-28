const express = require('express');
const validate = require('express-validation');
const authController = require('./controllers/authController');
const validators = require('./controllers/validators');

const router = express.Router();

router.post('/api/login', validate(validators.login), authController.login);

module.exports = router;
