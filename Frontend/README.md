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

The contact API is a separate Node service in the repository's `Backend` folder. Run it in a second terminal while developing the Angular app:

```bash
cd ../Backend
npm ci
npm start
```

The API listens on port `4000` by default, and the Angular dev-server proxy forwards `/api` requests to it. The API validates contact details, emails submissions, and appends each submission to `Backend/data/contact-submissions.jsonl`. See [Backend/README.md](../Backend/README.md) for email configuration and deployment settings.

The custom domain uses GitHub Pages for the frontend and Render for the separate contact API. The contact form detects `dream2decor.in` and posts to `https://dream2decor.onrender.com/api/contact`. After changing the frontend, publish it to the existing GitHub Pages branch with:

```bash
ng deploy --base-href=/ --cname=dream2decor.in
```

Render deploys the API from `Backend` independently of the Angular frontend. The Angular SSR build remains available for Node hosting if needed, but its rendering server does not implement the contact API.
