const { isCelebrate } = require('celebrate');

class DemokratiaError extends Error {
	constructor(message, code, httpStatus) {
		super(message);
		this.errObject = { message, code };
		this.httpStatus = httpStatus;
	}
}

class AdminRequiredError extends DemokratiaError {
	constructor() {
		super('You must be an admin to do that', 'admin_required', 403);
	}
}
module.exports.AdminRequiredError = AdminRequiredError;

class AuthenticationRequiredError extends DemokratiaError {
	constructor() {
		super('You must be logged in to do that',
			'authentication_required', 401);
	}
}
module.exports.AuthenticationRequiredError = AuthenticationRequiredError;

class CredentialsError extends DemokratiaError {
	constructor() {
		super('Invalid user/password combination', 'wrong_user_pass', 400);
	}
}
module.exports.CredentialsError = CredentialsError;

class DuplicateObjectError extends DemokratiaError {
	constructor(objectType) {
		super(`A(n) "${objectType}" object with that name already exists`,
			'duplicate_object', 400);
	}
}
module.exports.DuplicateObjectError = DuplicateObjectError;

class InvalidSessionError extends DemokratiaError {
	constructor() {
		super('Invalid session. Please log in again', 'invalid_session', 401);
	}
}
module.exports.InvalidSessionError = InvalidSessionError;

class MissingRolesError extends DemokratiaError {
	constructor() {
		super('You don\'t have the required roles', 'missing_roles', 403);
	}
}
module.exports.MissingRolesError = MissingRolesError;

class UnknownObjectError extends DemokratiaError {
	constructor(objectType) {
		super(`There are no "${objectType}" objects with such name`,
			'unknown_object', 404);
	}
}
module.exports.UnknownObjectError = UnknownObjectError;

class WrongPropertiesError extends DemokratiaError {
	constructor() {
		super('None of the provided parameters are compatible with this model',
			'no_valid_model_properties', 400);
	}
}
module.exports.WrongPropertiesError = WrongPropertiesError;

// eslint-disable-next-line no-unused-vars
module.exports.globalErrorHandler = (err, req, res, next) => {
	// This is a controlled error, it has been thrown by demokratia's own
	// code and we expected it might happen
	if (err instanceof DemokratiaError) {
		return res.status(err.httpStatus).json(err.errObject);
	}
	// The exception for parameter validation problems is already provided
	// by celebrate, using that one to put the violations in the error object
	// as well
	if (isCelebrate(err)) {
		return res.status(400).json({
			message: 'Invalid parameters',
			code: 'invalid_parameters',
			violations: err.details,
		});
	}
	// Errors produced by Express's body-parser, that are thrown whenever the
	// body cannot be parsed because it isn't valid JSON
	if (err.type === 'entity.parse.failed') {
		return res.status(400).json({
			message: 'Invalid JSON object in the request\'s body',
			code: 'invalid_json_body',
		});
	}
	// Unknown error, something we haven't handled (and a potential bug).
	// Throw an internal server error and display it in the logs
	console.error(err); // eslint-disable-line no-console
	return res.status(500).json({
		message: 'Internal server error',
		code: 'internal_server_error',
	});
};
