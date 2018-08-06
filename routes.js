const express = require('express');
const validate = require('express-validation');
const authController = require('./controllers/authController');
const electionController = require('./controllers/electionController');
const validators = require('./controllers/validators');

const router = express.Router();

router.post('/api/login', validate(validators.login), authController.login);
router.post('/api/logout', authController.logout);

// Endpoints that require authentication
router.use(authController.authRequired);

router.get('/api/elections', electionController.listElections);
router.get('/api/elections/:electionName', electionController.getElection);

// Endpoints limited to administrators
router.use(authController.adminRequired);

router.post('/api/elections', validate(validators.election),
	electionController.addElection);
router.patch('/api/elections/:electionName',
	validate(validators.updateElection), electionController.updateElection);
router.delete('/api/elections/:electionName',
	electionController.deleteElection);
router.post('/api/elections/:electionName/polls', validate(validators.poll),
	electionController.addPoll);

module.exports = router;
