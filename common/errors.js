const { ValidationError } = require('express-validation');

class DemokratiaError extends Error {
	constructor(message, code, httpStatus) {
		super(message);
		this.errObject = { message, code };
		this.httpStatus = httpStatus;
	}
}

class CredentialsError extends DemokratiaError {
	constructor() {
		super('Invalid user/password combination.', 'wrong_user_pass', 400);
	}
}
module.exports.CredentialsError = CredentialsError;

class DuplicateElectionError extends DemokratiaError {
	constructor() {
		super('An election with that name already exists',
			'duplicate_election', 400);
	}
}
module.exports.DuplicateElectionError = DuplicateElectionError;

class MissingRolesError extends DemokratiaError {
	constructor() {
		super('You don\'t have the required roles', 'missing_roles', 403);
	}
}
module.exports.MissingRolesError = MissingRolesError;

class UnknownElectionError extends DemokratiaError {
	constructor() {
		super('There are no elections with such name.', 'unknown_poll', 404);
	}
}
module.exports.UnknownElectionError = UnknownElectionError;

module.exports.globalErrorHandler = (err, req, res, next) => {
	// This is a controlled error, it has been thrown by demokratia's own
	// code and we expected it might happen
	if (err instanceof DemokratiaError) {
		return res.status(err.httpStatus).json(err.errObject);
	}
	// The exception for parameter validation problems is already provided
	// by express-validation, using that one to put the violations in the
	// error object as well
	if (err instanceof ValidationError) {
		return res.status(400).json({
			message: 'Invalid parameters.',
			code: 'invalid_parameters',
			violations: err.errors,
		});
	}
	// Unknown error, something we haven't handled (and a potential bug).
	// Throw an internal server error and display it in the logs
	console.error(err); // eslint-disable-line no-console
	res.status(500).json({
		message: 'Internal server error',
		code: 'internal_server_error',
	});
	return next(err);
};
