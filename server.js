/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();

// eslint-disable-next-line import/no-unresolved
const config = require('./config.json');
const routes = require('./routes');
const { globalErrorHandler } = require('./common/errors');

// Load the Mongoose model for user profiles
require('./models/UserModel');


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

	// Parser for the requests' body
	app.use(express.json({ limit: '50mb' }));
	app.use(express.urlencoded({ extended: false }));
	// Session storage
	app.use(session({
		name: 'auth',
		secret: config.store.secret,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
		resave: false,
		cookie: { secure: 'auto' },
		saveUninitialized: false,
	}));
	// Static Angular distributables
	app.use(express.static(path.join(__dirname, 'dist')));
	// Routing middleware
	app.use(routes);
	// Global error handling for custom responses on validation errors
	app.use(globalErrorHandler);

	// Start listening to requests
	app.listen(config.serverPort,
		() => console.log('Listening for requests on port', config.serverPort));
});
