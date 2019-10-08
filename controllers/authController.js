const axios = require('axios');

const User = require('../models/User');
const { adminRole, votingRole, auth } = require('../config.json');
const {
	AdminRequiredError, AuthenticationRequiredError, CredentialsError,
	InvalidSessionError, MissingRolesError,
} = require('../common/errors');

module.exports.getServiceData = async (req, res, next) => {
	try {
		return res.status(200).json({ service: auth.service, scope: auth.scope, server: auth.server });
	} catch (e) {
		return next(e);
	}
};

module.exports.login = async (req, res, next) => {
	try {
		const response = await axios.get(`${auth.server}/api/service/user`, { params: { token: req.body.token, secret: auth.secret } });
		const { data } = response;
		if (!data.name) throw new InvalidScopeError();

		const user = await User.findOneAndUpdate({ authId: data._id }, { $setOnInsert: { name: data.name, alias: data.alias }, $set: { roles: data.roles } }, { upsert: true, new: true, fields: '_id name roles alias' });
		if (!user.roles.includes(votingRole) && !user.roles.includes(adminRole)) throw new MissingRolesError();

		req.session.token = req.body.token;
		req.session.userId = user._id;
		return res.status(200).json({ user });
	} catch (e) {
		return next(e);
	}
};

module.exports.getUser = (req, res, next) => (
	User.findOne({ _id: req.session.userId }, '-_id name alias roles')
		.then((user) => {
			if (user === null) throw new AuthenticationRequiredError();

			return res.json(user);
		})
		.catch(e => next(e))
);

module.exports.logout = (req, res) => (
	req.session.destroy((e) => {
		if (e) throw e;
		return res.sendStatus(204);
	})
);

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
