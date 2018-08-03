const crypto = require('crypto');

const User = require('../models/UserModel');
// eslint-disable-next-line import/no-unresolved
const { adminRole, votingRole } = require('../config.json');
const {
	AdminRequiredError, AuthenticationRequiredError, CredentialsError,
	InvalidSessionError, MissingRolesError,
} = require('../common/errors');

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
			if (!user.roles.includes(votingRole)) throw new MissingRolesError();

			// Successful login. Set the session up and send the minimal set of
			// user information required by the application
			req.session.userId = user.id;
			return res.status(200).json({
				name: user.name,
				alias: user.alias,
				email: user.email,
			});
		})
		.catch(e => next(e));
};

module.exports.authRequired = (req, res, next) => {
	if (!req.session.userId) return next(new AuthenticationRequiredError());

	return next();
};

module.exports.adminRequired = (req, res, next) => (
	User.findById(req.session.userId)
		.then((user) => {
			if (user === null) throw new InvalidSessionError();
			if (!user.roles.includes(adminRole)) throw new AdminRequiredError();

			return next();
		})
		.catch(e => next(e))
);
