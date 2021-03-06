# WebUi

The Web front-end for FonzRecon.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Running

This project requires using Node.js to build the site.  You'll need the right
versions of node (at least v4) and npm (at least v3) installed.

From the `web-ui` directory, run `npm install` to install the correct
dependencies for the project.

The following commands require using the `ng` command that comes with the
`angular-cli` module.  You'll find the command in the `node_modules/.bin/ng`
directory, after the `npm install` is run.


### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.  You can also add in the `--aot` for
ahead-of-time compilation of code.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


## Production

### Releasing to Production

Right now, the URL of the rest server is hard-coded in [api.service.ts](src/app/_services/api.service.ts).  This must be changed to
put the server into production.


### Configuring HTTP Server

The routes in the application are setup to allow easy configuring of the
HTTP server to route the requests to the Angular application, while still
providing a front-end to the rest service in the same server.

The REST server uses two root URLs: `/api` and `/auth`.  The Angular application
creates a simulated URL under its path at `/webui`.

By setting the simulated URL to `/webui`, you can configure your HTTP server to
redirect 404 errors from `/webui` to `/index.html`.

Reference: [Configuring Anglular 2 routes](http://stackoverflow.com/questions/40142130/configure-history-pushstate-for-angular-2)


## Developing

### Routes

All routes, except for the `HomeComponent`, must be under the /webui sub-url.
This allows proper rerouting on a front-end server (such as nginx).
