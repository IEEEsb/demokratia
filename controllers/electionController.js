const Election = require('../models/Election');
const User = require('../models/UserModel');
const Ballot = require('../models/Ballot');
const { arraysEqual } = require('../common/util');
const {
	DuplicateObjectError, InvalidCandidateError, NotInCensusError,
	PollsClosedError, PollsNotClosedError, UnknownObjectError,
	WrongBallotPollsError, WrongPropertiesError,
} = require('../common/errors');

const { votingRole } = require('../config.json');

module.exports.listElections = (req, res, next) => (
	Election.find({}, '-_id -__v -longDescription -remainingVoters -polls -ballots')
		.then(elections => res.json(elections))
		.catch(e => next(e))
);

module.exports.addElection = (req, res, next) => (
	User.find({ roles: votingRole })
		.distinct('_id') // Return an array of ids, rather than objects
		.then(userIds => Election.create({
			remainingVoters: userIds,
			censusSize: userIds.length,
			...req.body,
		}))
		.then(election => res.json(election))
		.catch((e) => {
			// E11000 is Mongo's error for duplicate key
			if (e.code === 11000) return next(new DuplicateObjectError('Election'));

			return next(e);
		})
);

module.exports.updateElection = (req, res, next) => (
	Election.update({ name: req.params.electionName }, req.body)
		.then((result) => {
			// Make sure that at least one of the provided fields was valid
			if (result.ok === 0) throw new WrongPropertiesError();
			// Check if any Elections were updated after the operation
			if (result.n === 0) throw new UnknownObjectError('Election');

			// The backend doesn't complain if the Election existed but it
			// didn't suffer any modifications at all, it just accepts the
			// request and leaves the object unmutated

			return res.sendStatus(200);
		})
		.catch((e) => {
			// E11000 is Mongo's error for duplicate key
			if (e.code === 11000) return next(new DuplicateObjectError('Election'));

			return next(e);
		})
);

module.exports.deleteElection = (req, res, next) => (
	Election.deleteOne({ name: req.params.electionName })
		.then((result) => {
			// Check if any Elections were deleted after the operation
			if (result.n === 0) throw new UnknownObjectError('Election');

			return res.sendStatus(200);
		})
		.catch(e => next(e))
);

module.exports.getElection = (req, res, next) => (
	Election.findOne({ name: req.params.electionName },
		'-_id -__v -remainingVoters -ballots')
		// The _ids are intentionally included here, to be able to put them in
		// the ballot when voting
		.populate('polls.candidacies.user', 'name alias')
		.then((election) => {
			if (election === null) throw new UnknownObjectError('Election');

			return res.json(election);
		})
		.catch(e => next(e))
);

module.exports.vote = (req, res, next) => (
	Election.findOne({ name: req.params.electionName })
		.then((election) => {
			if (election === null) throw new UnknownObjectError('Election');
			if (Date.now() < election.startDate || election.endDate < Date.now()) {
				throw new PollsClosedError(election.startDate, election.endDate);
			}
			if (!election.remainingVoters.find(
				remVoter => remVoter.toString() === req.session.userId
			)) {
				throw new NotInCensusError();
			}

			const existingPollNames = election.polls.map(poll => poll.name);
			const ballotPollNames = req.body.choices.map(choice => choice.poll);
			// In order to assure the ballot's integrity and completeness, we
			// require it to contain nothing but a vote for every poll in the
			// election
			if (!arraysEqual(existingPollNames, ballotPollNames)) {
				throw new WrongBallotPollsError(existingPollNames);
			}

			const promiseStack = [];
			for (let i = 0; i < req.body.choices.length; i++) {
				const currentChoice = req.body.choices[i];

				if (currentChoice.candidate === null) {
					// If the candidate is null (blank vote), we still want to
					// consider it a valid one. We add a non-null padding to
					// make the indices in the result match the ones in
					// req.body.choices
					promiseStack.push(true);
				} else {
					// Check that the polls contain the chosen candidate, by
					// looking for that pollName-candidate pair
					promiseStack.push(Election.findOne({
						polls: {
							$elemMatch: {
								name: currentChoice.poll,
								'candidacies.user': currentChoice.candidate,
							},
						},
					}));
				}
			}

			return Promise.all(promiseStack);
		})
		.then((results) => {
			// If any of the results is null, it means that the candidate could
			// not be found in that specific poll
			const violatingChoiceIdx = results.findIndex(r => r === null);
			if (violatingChoiceIdx !== -1) {
				throw new InvalidCandidateError(
					req.body.choices[violatingChoiceIdx].poll
				);
			}

			const ballot = new Ballot({ choices: req.body.choices });
			return Election.update({ name: req.params.electionName }, {
				$push: { ballots: ballot },
				$pull: { remainingVoters: req.session.userId },
			})
				// Continue the promise chain here to have acess to the ballot
				.then(res.json({ secret: ballot.id }));
		})
		.catch(e => next(e))
);

module.exports.results = (req, res, next) => (
	Election.findOne({ name: req.params.electionName })
		.then((election) => {
			if (election === null) throw new UnknownObjectError('Election');
			// The results can only be seen once the Election has ended
			if (Date.now() < election.endDate) {
				throw new PollsNotClosedError(election.endDate);
			}

			return Election.aggregate([
				// Use only the polls in this Election
				{ $match: { name: req.params.electionName } },
				// Unwind the ballots first, and then each of their choices.
				// "$ballots" has to be unwinded first because
				// "$ballots.choices" would not work otherwise
				{ $unwind: '$ballots' },
				{ $unwind: '$ballots.choices' },
				// Extract all the votes from all the ballots:
				// 	[{
				// 		"poll": "<poll_name_1>",
				// 		"candidate": ObjectId("...")
				// 	}, { ... }]
				{
					$project: {
						poll: '$ballots.choices.poll',
						candidate: '$ballots.choices.candidate',
					},
				},
				// Calculate the count for each poll-candidate pair:
				// 	[{
				// 		"_id": {
				// 			"poll": "<poll_name_1>",
				// 			"candidate": ObjectId("...")
				// 		},
				// 		"votes": <n_votes>
				// 	}, { ... }]
				{
					$group: {
						_id: {
							poll: '$poll',
							candidate: '$candidate',
						},
						votes: { $sum: 1 },
					},
				},
				// Sort the pairs by amount of votes in descending order. Thus
				// it's safe to take the first item of "counts" as the poll's
				// winner (as long as there isn't a tie or it's null)
				{ $sort: { votes: -1 } },
				// Group the pairs by poll:
				// 	[{
				// 		"poll": "<poll_name_1>",
				// 		"counts": [{
				// 				"candidate": ObjectId("..."),
				// 				"votes": <n_votes>
				// 		}, { ... }]
				// 	}, { ... }]
				{
					$group: {
						_id: '$_id.poll',
						poll: { $first: '$_id.poll' },
						counts: {
							$push: {
								candidate: '$_id.candidate',
								votes: '$votes',
							},
						},
					},
				},
				// Hide the result's _ids (which have the same value as "poll",
				// but are required for the aggregation to work properly
				{ $project: { _id: false } },
			]);
		})
		.then(result => User.populate(result, {
			path: 'counts.candidate',
			select: 'alias name',
		}))
		.then(result => res.json(result))
		.catch(e => next(e))
);

module.exports.checkBallot = (req, res, next) => (
	Election.findOne({ name: req.params.electionName })
		.then((election) => {
			if (election === null) throw new UnknownObjectError('Election');

			return Election.findOne({
				name: req.params.electionName,
				ballots: { $elemMatch: { _id: req.params.token } },
			}, '-_id ballots.choices.$')
				.populate('ballots.choices.candidate', 'name alias');
		})
		.then(election => res.json(election.ballots[0]))
		.catch(e => next(e))
);
