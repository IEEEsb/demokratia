const mongoose = require('mongoose');

const { Schema } = mongoose;

const Poll = new Schema({
	name: { type: String, required: true, unique: true },
	title: { type: String, required: true },
	shortDescription: { type: String },
	longDescription: { type: String },
});

module.exports = mongoose.model('Poll', Poll);
