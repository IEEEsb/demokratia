const mongoose = require('mongoose');

const { Schema } = mongoose;

const Poll = new Schema({
	// An identifier for the poll, like the charge being chosen
	name: {
		type: String,
		required: true,
		unique: true,
		sparse: true,
	},
	// A human-readable question that makes clear what is being voted in the
	// poll
	question: { type: String, required: true },
	// A longer description of the poll, like details on what the specific
	// charge should do
	description: { type: String },
	// The users that want to participate as electable members in the poll
	candidacies: [
		{
			_id: false,
			user: { type: Schema.Types.ObjectId, ref: 'UserModel', required: true },
		},
	],
});

module.exports = mongoose.model('Poll', Poll);
