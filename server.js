/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();

const config = require('./config.json');
const routes = require('./routes');
const { globalErrorHandler } = require('./common/errors');

// Load the Mongoose model for user profiles
require('./models/UserModel');

// Parser for the requests' body
app.use(express.urlencoded({ extended: false }));
// Session storage
app.use(session({
	name: 'auth',
	secret: config.store.secret,
	resave: false,
	cookie: { secure: 'auto' },
	saveUninitialized: false,
}));
// Routing middleware
app.use(routes);
// Global error handling for custom responses on validation errors
app.use(globalErrorHandler);

console.log('===================================');
console.log('        >>> DEMOKRATIA <<<');
console.log(' IEEE Student Branch voting system');
console.log('===================================\n');

// Connect to the MongoDB database
mongoose.connect(config.mongo.serverUrl, {
	user: config.mongo.user,
	pass: config.mongo.pass,
	useNewUrlParser: true,
}).then(() => {
	console.log(`Connected to MongoDB instance at ${config.mongo.serverUrl}`);

	// Start listening to requests
	app.listen(config.serverPort,
		() => console.log('Listening for requests on port', config.serverPort));
});
