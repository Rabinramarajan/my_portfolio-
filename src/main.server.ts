import { BootstrapContext } from '@angular/platform-browser';
import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { config } from './app/app.config.server';

// The context must be forwarded: without it the server bootstrap has no
// platform to attach to and prerendering fails with NG0401.
export default (context: BootstrapContext) => bootstrapApplication(App, config, context);
