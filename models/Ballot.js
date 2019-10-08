const mongoose = require('mongoose');
const { randomObjectId } = require('../common/util');

const { Schema } = mongoose;

const Ballot = new Schema({
	// Keep the ballot's ID from being sequential to avoid leaking information
	// about the votes' order when providing voters with their token after
	// voting
	_id: { type: Schema.Types.ObjectId, required: true, default: randomObjectId },
	choices: [
		{
			_id: false,
			// The name of the poll being voted
			poll: { type: String, required: true },
			// The ObjectId for the chosen candidate
			candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		},
	],
});

module.exports = mongoose.model('Ballot', Ballot);
