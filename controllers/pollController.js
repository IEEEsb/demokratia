const Election = require('../models/Election');
const Poll = require('../models/Poll');
const User = require('../models/UserModel');
const {
	DuplicateObjectError, UnknownObjectError, WrongPropertiesError,
} = require('../common/errors');

const { votingRole } = require('../config.json');

module.exports.addPoll = (req, res, next) => (
	Election.findOne({
		name: req.params.electionName,
	})
		.then((election) => {
			if (election === null) throw new UnknownObjectError('Election');

			// We need to repeat the query for the election's name. Otherwise
			// we won't be able to know if the update failed because the
			// election doesn't exist or because the poll was duplicate.
			return Election.update({
				name: req.params.electionName,
				'polls.name': { $ne: req.body.name },
			}, { $addToSet: { polls: new Poll(req.body) } });
		})
		.then((result) => {
			if (result.nModified === 0) throw new DuplicateObjectError('Poll');

			return res.sendStatus(200);
		})
		.catch(e => next(e))
);

module.exports.updatePoll = (req, res, next) => (
	Election.findOne({ name: req.params.electionName })
		.then((election) => {
			if (election === null) {
				throw new UnknownObjectError('Election');
			}

			return Election.findOne({
				name: req.params.electionName,
				'polls.name': req.params.pollName,
			})
				.distinct('polls.name');
		})
		.then((pollNames) => {
			// We already made sure that the election exists, so if there are
			// no polls in this query it means that pollName doesn't match any
			// existing poll (distinct returns an empty array if findOne's
			// result is null)
			if (pollNames.length === 0) {
				throw new UnknownObjectError('Poll');
			}

			// Make sure we don't rename a poll to an already existing name
			if (req.params.pollName !== req.body.name
				&& pollNames.some(pollName => pollName === req.body.name)) {
				throw new DuplicateObjectError('Poll');
			}

			return Election.update({
				name: req.params.electionName,
				'polls.name': req.params.pollName,
			}, {
				'polls.$.name': req.body.name,
				'polls.$.question': req.body.question,
				'polls.$.description': req.body.description,
			});
		})
		.then((result) => {
			// Make sure that at least one of the provided fields was valid
			if (result.ok === 0) throw new WrongPropertiesError();

			// The backend doesn't complain if the Election existed but it
			// didn't suffer any modifications at all, it just accepts the
			// request and leaves the object unmutated

			return res.sendStatus(200);
		})
		.catch(e => next(e))
);

module.exports.deletePoll = (req, res, next) => (
	Election.update({ name: req.params.electionName },
		{ $pull: { polls: { name: req.params.pollName } } })
		.then((result) => {
			// Check if any Elections were updated after the operation
			if (result.n === 0) throw new UnknownObjectError('Election');
			// Make sure that a Poll object was modified (i.e. pollName was
			// valid)
			if (result.nModified === 0) throw new UnknownObjectError('Poll');

			return res.sendStatus(200);
		})
		.catch(e => next(e))
);
