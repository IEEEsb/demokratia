# demokratia

*demokratia* is the voting system we use at [ETSIT-UPM's IEEE student
branch](https://ieeesb.es).

## Installation

To run your own instance of *demokratia*, you can use the code straight from
the repo's `master` branch:

```bash
$ git clone https://github.com/Repo-IEEEsb/demokratia.git
$ cd demokratia
```

Create the configuration file, `config.json`, which should contain the
following fields:

```json
{
    "serverPort": 8080,
    "adminRole": "admin",
    "votingRole": "ordinary",
    "mongo": {
        "serverUrl": "mongodb://localhost:27017/web",
        "user": "some_user",
        "pass": "some_password"
    },
    "store": {
        "secret": "some_session_secret"
    },
    "logFile": "/path/to/demokratia/logs.log (optional)"
}
```

If you set `logFile`, all the HTTP requests will be registered in the specified
file. Please note that *demokratia* will create the file if needed, but the
parent directory must exist beforehand.

Then install the dependencies, build the frontend files and start the server.
We recommend using Node v8.11.0 or superior. It may work in other versions, but
it hasn't been tested.

```bash
$ npm install
$ npm run build
$ npm start
```

## Development server

**TL;DR:** Run `npm run dev` to fire up the frontend + backend development
server.

The entry point, `server.js`, is designed to serve both the API and the
frontend files. If you want to test the frontend's interactions with the
backend, you'll need to have the frontend built and then served by `server.js`.
*Don't use `ng serve`*, because you can't have both servers running in the same
port.

To have live Angular builds (i.e. automatic rebuilds whenever a fronted file
changes), run:

```bash
$ npm run watch-front
```

You can also have the backend restarted whenever its files change:

```bash
$ npm run watch-back
```

Most of the times you will want both to be running at the same time. You can do
it from a single terminal with:

```bash
$ npm run dev
```

## Production server

To run *demokratia* on production, make a frontend build and start the server:

```bash
$ npm run build
$ npm start
```

Please make sure that your `config.json` contains safe values (strong
credentials, a session secret with high entropy, etc.).

## Contact us

This tool has been created by members of the [ETSIT-UPM IEEE student
branch](https://ieeesb.es).

Questions? Bugs? Patches!? Feel free to [create an issue](../../issues/new) or
[open a pull request](../../pulls).

## License

*demokratia*'s code is under the MIT license. You can read it in the
[LICENSE](LICENSE) file.

---

&copy; 2018 - Rama Universitaria del IEEE de Madrid
