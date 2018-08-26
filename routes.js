const express = require('express');
const authController = require('./controllers/authController');
const electionController = require('./controllers/electionController');
const pollController = require('./controllers/pollController');
const {
	validators, validate, validateWithoutStripping,
} = require('./controllers/validators');

const router = express.Router();

router.post('/api/login', validate(validators.login), authController.login);
router.post('/api/logout', authController.logout);

// Endpoints that require authentication
router.use(authController.authRequired);

router.get('/api/elections', electionController.listElections);
router.get('/api/elections/:electionName', electionController.getElection);
router.get('/api/elections/:electionName/electable',
	pollController.listPotentialCandidates);
router.post('/api/elections/:electionName/vote',
	validateWithoutStripping(validators.vote), electionController.vote);
router.get('/api/elections/:electionName/results', electionController.results);

// Endpoints limited to administrators
router.use(authController.adminRequired);

router.post('/api/elections', validate(validators.election),
	electionController.addElection);
router.patch('/api/elections/:electionName',
	validateWithoutStripping(validators.updateElection),
	electionController.updateElection);
router.delete('/api/elections/:electionName',
	electionController.deleteElection);
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
