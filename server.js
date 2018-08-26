/* eslint-disable no-console */
const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const morgan = require('morgan');
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

	// Development request logger
	if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
	// Request logger stored in a file, mostly for production
	if (config.logFile) {
		// Create stream for writing to the logs file. The "a" flag stands for
		// "append", and will create the file (not the parent dir!) if it
		// doesn't exist
		const stream = fs.createWriteStream(config.logFile, { flags: 'a' });
		morgan.token('user', (req) => {
			if (req.session) return req.session.userId;
			return 'not loggged in';
		});
		app.use(morgan('[:date[iso]] :remote-addr (:user) :method :url :status'
			+ ':res[content-length] B - :response-time ms', { stream }));
	}
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
