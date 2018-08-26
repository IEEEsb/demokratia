const crypto = require('crypto');

// Check if two arrays of primitive types contain the same elements
module.exports.arraysEqual = (a, b) => {
	if (!(a instanceof Array && b instanceof Array)) return false;
	if (a.length !== b.length) return false;

	// .sort() mutates the original array, so we make a coy via .slice()
	const sortedA = a.slice().sort();
	const sortedB = b.slice().sort();

	for (let i = 0; i < a.length; i++) {
		if (sortedA[i] !== sortedB[i]) return false;
	}

	return true;
};

// Create a random 24-character hex string that can be used as a MongoDB
// ObjectId
module.exports.randomObjectId = () => crypto.randomBytes(12).toString('hex');
