const { ValidationError } = require('express-validation');

class DemokratiaError extends Error {
	constructor(message, code, httpStatus) {
		super(message);
		this.errObject = { message, code };
		this.httpStatus = httpStatus;
	}
}

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
			error: 'invalid_parameters',
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