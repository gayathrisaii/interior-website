# InteriorWebsite

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Contact submissions

The Express SSR server provides `POST /api/contact`. It validates the submitted name, email, 10-digit phone number, and message, emails the submission to `umaprasad@dream2decor.in`, and appends it as a JSON object on its own line to `data/contact-submissions.jsonl`. This is file-based storage; no SQL database is used. The `data` directory is excluded from Git. Set `CONTACT_SUBMISSIONS_FILE` to choose another path.

Contact email is sent through Brevo's HTTPS transactional email API when `BREVO_API_KEY` is configured. This avoids Render's SMTP connectivity restrictions while keeping GoDaddy as the receiving mailbox. Configure a Brevo account, create and verify the sender address, and set these Render environment variables:

```text
BREVO_API_KEY=<your Brevo API key>
BREVO_FROM_EMAIL=umaprasad@dream2decor.in
BREVO_FROM_NAME=Dream2Decor Website
CONTACT_TO=umaprasad@dream2decor.in
```

Verify `umaprasad@dream2decor.in` as a sender in Brevo before testing. The API key is a secret: add it only in Render's environment settings, never in source code or frontend configuration. If `BREVO_API_KEY` is absent, the server falls back to GoDaddy SMTP (`smtpout.secureserver.net`, port `465`, implicit TLS); configure `EMAIL_USER` and `EMAIL_PASSWORD` for that fallback. The endpoint reports delivery failures rather than claiming the message was sent.

To run the contact API during development, first build and start the Node server in one terminal:

```bash
npm run build
npm run serve:ssr:interior-website
```

Then run `npm start` in a second terminal and open `http://localhost:4200/`. The Angular dev-server proxy forwards `/api` requests to the Node server on port 4000. After changing server-side code, rebuild and restart the Node server.

Deployments must run the Node SSR server (or another Node host providing this API). Static-only hosting does not run the submission endpoint. Protect and back up the submissions file according to your privacy requirements.
