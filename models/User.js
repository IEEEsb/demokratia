const mongoose = require('mongoose');

const { Schema } = mongoose;
const Float = require('mongoose-float').loadType(mongoose);

const User = new Schema({
	alias: { type: String, index: { unique: true, dropDups: true } },
	authId: { type: String, index: { unique: true, dropDups: true } },
	name: { type: String, required: true },
	roles: [{ type: String }],
});

module.exports = mongoose.model('User', User);
