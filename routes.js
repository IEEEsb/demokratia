const express = require('express');
const authController = require('./controllers/authController');
const electionController = require('./controllers/electionController');
const pollController = require('./controllers/pollController');
const {
	validators, validate, validateWithoutStripping,
} = require('./controllers/validators');

function selfUser(req, res, next) {
	req.params.userId = req.session.userId;
	next();
}

const router = express.Router();

router.get('/api/auth', authController.getServiceData);
router.post('/api/login', validate(validators.login), authController.login);

// Endpoints that require authentication
router.use(authController.authRequired);

router.post('/api/logout', authController.logout);
router.get('/api/user', authController.getUser);
router.get('/api/elections', electionController.listElections);
router.get('/api/elections/:electionName', electionController.getElection);
router.get('/api/elections/:electionName/can_vote',
	electionController.checkVoter);
router.post('/api/elections/:electionName/vote',
	validateWithoutStripping(validators.vote), electionController.vote);
router.get('/api/elections/:electionName/results', electionController.results);
router.get('/api/elections/:electionName/check/:token',
	validateWithoutStripping(validators.checkBallot),
	electionController.checkBallot);

// Endpoints limited to administrators
router.use(authController.adminRequired);

router.post('/api/elections', validate(validators.election),
	electionController.addElection);
router.patch('/api/elections/:electionName',
	validateWithoutStripping(validators.updateElection),
	electionController.updateElection);
router.delete('/api/elections/:electionName',
	electionController.deleteElection);
router.get('/api/elections/:electionName/electable',
	pollController.listPotentialCandidates);
router.post('/api/elections/:electionName/polls', validate(validators.poll),
	pollController.addPoll);
router.patch('/api/elections/:electionName/polls/:pollName',
	validate(validators.poll), pollController.updatePoll);
router.delete('/api/elections/:electionName/polls/:pollName',
	pollController.deletePoll);
router.post('/api/elections/:electionName/polls/:pollName/candidates',
	validate(validators.addCandidate), pollController.addCandidate);
router.delete('/api/elections/:electionName/polls/:pollName/candidates/:alias',
	pollController.deleteCandidate);

module.exports = router;
