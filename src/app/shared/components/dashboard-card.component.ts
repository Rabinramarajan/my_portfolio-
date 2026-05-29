import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  template: '<div>Dashboard Card</div>',
  styles: [':host { display: block; }']
})
export class DashboardCardComponent {}

@Component({
  selector: 'app-glassmorphism-card',
  template: '<div>Glassmorphism Card</div>',
  styles: [':host { display: block; }']
})
export class GlassmorphismCardComponent {}