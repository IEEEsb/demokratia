const { Joi, celebrate } = require('celebrate');

// Customize the default settings for Joi's validator, in a way that properties
// not defined in the validation schema don't produce any error, but are
// removed from the request
module.exports.validate = (validator, options) => (
	celebrate(validator, { stripUnknown: true, allowUnknown: true, ...options })
);
// A version of the validator that doesn't remove undefined properties from the
// response. Useful for validations that only forbid certain keys (like for
// updates)
module.exports.validateWithoutStripping = (validator, options) => (
	celebrate(validator, { allowUnknown: true, ...options })
);

module.exports.validators = {
	login: {
		body: {
			alias: Joi.string().required(),
			password: Joi.string().required(),
		},
	},
	election: {
		body: {
			name: Joi.string().token().required(),
			title: Joi.string().required(),
			shortDescription: Joi.string().required(),
			longDescription: Joi.string(),
			startDate: Joi.string().isoDate().required(),
			endDate: Joi.string().isoDate().required(),
		},
	},
	updateElection: {
		// Just ban the fields that shouldn't be directly modified by any user
		// at all (not even admins)
		body: {
			remainingVoters: Joi.any().forbidden(),
			censusSize: Joi.any().forbidden(),
			createdDate: Joi.any().forbidden(),
			polls: Joi.any().forbidden(),
			ballots: Joi.any().forbidden(),
		},
	},
	poll: {
		body: {
			name: Joi.string().required(),
			question: Joi.string().required(),
			description: Joi.string(),
		},
	},
	addCandidate: {
		body: {
			alias: Joi.string().required(),
			proposal: Joi.string().required(),
		},
	},
	vote: {
		body: {
			choices: Joi.array().required().items(Joi.object({
				poll: Joi.string().required(),
				candidate: Joi.string().hex().length(24, 'ascii').allow(null)
					.required(),
			})),
		},
	},
};
