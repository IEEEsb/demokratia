const crypto = require('crypto');

const User = require('../models/UserModel');

function CredentialsError() {}

function authenticationRequiredResponse(res) {
    return res.status(401).json({
        error: 'You must be logged in to do that.',
        code: 'authentication_required',
    });
}

function validateSaltedPassword(password, salt, hash, iterations) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password.toLowerCase(), salt, iterations, 256, 'sha256',
            (err, key) => {
                if (err) return reject(err);
                const calculatedHash = key.toString('hex');
                return resolve(calculatedHash === hash);
            });
    });
}

module.exports.login = (req, res, next) => {
    let user;

    return User.findOne({ alias: req.body.alias.toLowerCase() })
        .then((item) => {
            user = item;
            // Check that the specified user exists in the DB
            if (user === null) throw new CredentialsError();

            // Validate the password provided against the one stored for this
            // user, using their specific salt
            return validateSaltedPassword(req.body.password, user.pwd.salt,
                user.pwd.hash, user.pwd.iterations);
        })
        .then((isValid) => {
            // Check that the password is correct
            if (!isValid) throw new CredentialsError();

            // Successful login. Set the session up and send the minimal set of
            // user information required by the application
            req.session.userId = user.id;
            return res.status(200).json({
                name: user.name,
                alias: user.alias,
                email: user.email,
            });
        })
        .catch((e) => {
            if (e instanceof CredentialsError) {
                return res.status(400).json({
                    error: 'Invalid user/password combination.',
                    code: 'wrong_user_pass',
                });
            }

            return next(e);
        });
};

module.exports.authRequired = (req, res, next) => {
    if (!req.session.userId) return authenticationRequiredResponse(res);

    return next();
};
