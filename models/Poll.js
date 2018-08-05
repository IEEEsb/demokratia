const mongoose = require('mongoose');

const { Schema } = mongoose;

const Poll = new Schema({
	// An identifier for the poll, like the charge being chosen
	name: { type: String, required: true, unique: true },
	// A human-readable question that makes clear what is being voted in the
	// poll
	question: { type: String, required: true },
	// A longer description of the poll, like details on what the specific
	// charge should do
	description: { type: String },
	// The possible non-blank votes for this poll
	candidates: [{ type: Schema.Types.ObjectId, unique: true }],
	// Don't create IDs for polls in order to keep them unique when adding them
	// to an election
}, { _id: false });

module.exports = mongoose.model('Poll', Poll);
