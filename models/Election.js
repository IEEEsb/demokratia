const mongoose = require('mongoose');
const PollSchema = require('./Poll').schema;

const { Schema } = mongoose;

const Election = new Schema({
	// An alias for the election ([a-zA-Z0-9_])
	name: { type: String, required: true, unique: true },
	// A human-readable title
	title: { type: String, required: true },
	// One-line description of the election
	shortDescription: { type: String, required: true },
	// Detailed explanation of the election's conditions
	longDescription: { type: String },
	// Which users can vote during these elections. The items will be
	// removed as users vote
	remainingVoters: [{ type: Schema.Types.ObjectId }],
	// When should the polls open and close, and creation metadata
	startDate: { type: Date, required: true },
	endDate: { type: Date, required: true },
	createdDate: { type: Date, required: true, default: Date.now },
	// An array with all the things that are being decided in these
	// elections
	polls: [{ type: PollSchema }],
});

module.exports = mongoose.model('Election', Election);
