import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule],
  template: '<div>Dashboard Card</div>',
  styles: [':host { display: block; }']
})
export class DashboardCardComponent {}

@Component({
  selector: 'app-glassmorphism-card',
  standalone: true,
  imports: [CommonModule],
  template: '<div>Glassmorphism Card</div>',
  styles: [':host { display: block; }']
})
export class GlassmorphismCardComponent {}