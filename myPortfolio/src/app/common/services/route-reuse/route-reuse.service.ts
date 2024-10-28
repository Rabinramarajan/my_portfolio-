import { Injectable, Injector } from '@angular/core';
import { RouteReuseStrategy, DetachedRouteHandle, Router, NavigationStart, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouteReuseService implements RouteReuseStrategy {
  private handlers: { [key: string]: DetachedRouteHandle } = {};
  private isBackNavigation = false;
  private fromUrl = '';
  private router!: Router;
  constructor(private injector: Injector) {
    setTimeout(() => {
      this.router = this.injector.get(Router);
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.isBackNavigation = event.navigationTrigger === 'popstate';
        }
      });
    }, 0);
  }
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data['reuse'] === true;
  }
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (route.data['reuse'] === true) {
      let path = route.routeConfig?.path;
      if (!path || !handle) return;
      this.handlers[path] = handle;
    }
  }
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    let path = route.routeConfig?.path;
    if (!path) return false;
    return this.isBackNavigation && route.data['reuse'] === true && !!this.handlers[path];
  }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (this.isBackNavigation && route.data['reuse'] === true) {
      let path = route.routeConfig?.path;
      if (!path) return null;
      return this.handlers[path];
    }
    return null;
  }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig?.path === curr.routeConfig?.path && future.data['reuse'] === true;
  }
}
