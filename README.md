# MyPortolioNg22

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.6.

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

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Deployment (Vercel)

The app is a static Angular SPA and deploys to Vercel with zero server. Config lives in [`vercel.json`](vercel.json):

- **Build command:** `ng build`
- **Output directory:** `dist/my-portolio-ng22/browser`
- **SPA fallback:** all non-asset routes rewrite to `/index.html` so client-side routing and deep links work.
- **Security & caching headers:** hardening headers on every response plus a 1-year immutable cache for hashed assets.

### First-time setup

1. Push the repo to GitHub and **Import Project** in Vercel (it reads `vercel.json` automatically — no framework preset overrides needed).
2. Or deploy from the CLI:
   ```bash
   npm i -g vercel
   vercel        # preview deploy
   vercel --prod # production deploy
   ```
3. In the Vercel dashboard, enable **Web Analytics** and **Speed Insights** for the project (Analytics tab → Enable). The client is already wired up in [`src/app/app.ts`](src/app/app.ts) and only activates on production builds in the browser.

## Bundle analysis

Inspect what makes up the bundle:

```bash
npm run analyze     # builds with --stats-json and opens an esbuild treemap
npm run build:stats # just emits dist/my-portolio-ng22/stats.json
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
