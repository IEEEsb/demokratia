const Joi = require('joi');

module.exports = {
    login: {
        body: {
            alias: Joi.string().required(),
            password: Joi.string().required(),
        },
    },
};
