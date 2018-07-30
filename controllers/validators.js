const Joi = require('joi');

// Remove any parameter that isn't explicitly validated here. Useful for using
// default values in Mongoose models as automatic setters
Joi.any().options({
    stripUnknown: true,
});

module.exports = {
    login: {
        body: {
            alias: Joi.string().required(),
            password: Joi.string().required(),
        },
    },
};
