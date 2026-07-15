import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { httpResource, type HttpResourceRef } from '@angular/common/http';

import { APP_CONFIG } from '../tokens/app-config.token';
import { DATA_FILES, type DataKey, type DataResources } from '../constants/data-files.constant';

/**
 * Central, tree-shakable gateway for all JSON-driven content.
 *
 * Built entirely on the Angular Resource API (`httpResource`) — callers get a
 * reactive, typed resource with `.value() / .isLoading() / .error()` and never
 * subscribe manually. Create resources from an injection context (component
 * field initializers), which is the idiomatic usage.
 *
 * @example
 * private readonly data = inject(DataService);
 * protected readonly profile = this.data.load('profile');
 * // template: profile.value()?.name
 */
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly config = inject(APP_CONFIG);
  private readonly injector = inject(Injector);

  /** Shared, deduplicated resources keyed by data key (see {@link shared}). */
  private readonly cache = new Map<DataKey, HttpResourceRef<unknown>>();

  /** Build the absolute-from-root URL for a data key. */
  private urlFor(key: DataKey): string {
    return `${this.config.dataBasePath}/${DATA_FILES[key]}`;
  }

  /**
   * Create a typed HTTP resource for the given data key.
   * Must be called within an injection context.
   */
  load<K extends DataKey>(key: K): HttpResourceRef<DataResources[K] | undefined> {
    return httpResource<DataResources[K]>(() => this.urlFor(key));
  }

  /**
   * Return a single, application-wide resource for the given key, created once
   * on first request and reused by every caller thereafter — deduping the fetch
   * and centralising the signal. Use for content read across many components
   * (e.g. the {@link profile}); use {@link load} for page-local resources.
   *
   * Created in the service's own injection context, so it is safe to call from
   * anywhere (field initialisers, methods) regardless of the caller's context.
   */
  shared<K extends DataKey>(key: K): HttpResourceRef<DataResources[K] | undefined> {
    let resource = this.cache.get(key);
    if (!resource) {
      resource = runInInjectionContext(this.injector, () => this.load(key));
      this.cache.set(key, resource);
    }
    return resource as HttpResourceRef<DataResources[K] | undefined>;
  }

  /** Shared, deduplicated profile resource — loaded by many components. */
  profile(): HttpResourceRef<DataResources['profile'] | undefined> {
    return this.shared('profile');
  }
}
