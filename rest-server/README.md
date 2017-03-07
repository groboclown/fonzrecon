# REST API Server

This directory contains the NodeJS application server that responds to
REST api calls for the underlying database.

The service requires a MongoDB server.

You can configure the service with these environment variables:

* **`DATABASE_URL`** - References the MongoDB server.
  Defaults to `mongodb://localhost:27017`
* **`NODE_ENV`** - Allow you to switch between `test`, `development`, and `production` environments.  This requires customizing the [config/env](config/env) files.
* **`PORT`** - Specifies the port that the application server will listen for incoming requests.  Defaults to `3000`
* **`SECRET_SIGNING_KEY`** - The signing key used to hash the passwords and create client session tokens.
* **`SSL_KEY`** and **`SSL_CERT`** - the SSL key and certificate files.  Only specify these if you want to receive HTTPS connections.


## Local Testing

To start the server, simply run:

```bash
npm start
```

If you want to run in Docker, then you can run a complete NodeJS and MongoDB environment with:

```bash
docker-compose up -d
```

This will bring up the node server, waiting on port 3000.
