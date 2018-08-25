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
			createdDate: Joi.any().forbidden(),
			polls: Joi.any().forbidden(),
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
};
