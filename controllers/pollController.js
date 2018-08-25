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

module.exports.addCandidate = (req, res, next) => {
	// TODO: Make sure that the candidate isn't present in any other Poll of
	// this Election
	let user;

	return User.findOne({ alias: req.body.alias, roles: votingRole })
		.then((item) => {
			user = item;
			// We also consider that the user doesn't exist if they don't have the required
			// roles, just to avoid leaking user role information
			if (user === null) throw new UnknownObjectError('User');

			return Election.findOne({ name: req.params.electionName });
		})
		.then((election) => {
			if (election === null) throw new UnknownObjectError('Election');

			return Election.update({
				name: req.params.electionName,
				'polls.name': req.params.pollName,
			},
			{
				$addToSet: {
					'polls.$.candidacies': {
						user: user.id,
					},
				},
			});
		})
		.then((result) => {
			// Check that the provided pollName was valid
			if (result.n === 0) throw new UnknownObjectError('Poll');

			// Make sure that a Poll object was modified (i.e. the candidate
			// wasn't duplicate)
			if (result.nModified === 0) throw new DuplicateObjectError('Candidate');

			return res.sendStatus(200);
		})
		.catch(e => next(e));
};

module.exports.deleteCandidate = (req, res, next) => (
	Election.findOne({ name: req.params.electionName })
		.then((election) => {
			if (election === null) throw new UnknownObjectError('Election');

			return User.findOne({ alias: req.params.alias });
		})
		.then((user) => {
			// Just to have an undefined userId when the user doesn't exist, so
			// the update operation will end up with an nModified === 0. We
			// could check if user is null here, but this way we avoid having
			// multiple sources of UnknownObjectErrors for candidates
			const userId = (user || {}).id;

			return Election.update({
				name: req.params.electionName,
				'polls.name': req.params.pollName,
			}, { $pull: { 'polls.$.candidacies': { user: userId } } });
		})
		.then((result) => {
			// Check if any Elections were updated after the operation
			if (result.n === 0) throw new UnknownObjectError('Poll');
			// Make sure that a Poll object was modified (i.e. pollName was
			// valid)
			if (result.nModified === 0) throw new UnknownObjectError('Candidate');

			return res.sendStatus(200);
		})
		.catch(e => next(e))
);

module.exports.listPotentialCandidates = (req, res, next) => (
	// List all the users that can be candidates (i.e. they have the
	// votingRole) but aren't candidates for any Poll in this Election yet
	Election.findOne({ name: req.params.electionName })
		.distinct('polls.candidacies.user')
		.then(candidates => User.find({
			roles: votingRole,
			_id: { $nin: candidates },
		}, '-_id name alias'))
		.then(users => res.json({ users }))
		.catch(e => next(e))
);
