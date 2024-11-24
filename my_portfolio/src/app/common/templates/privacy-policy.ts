import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-privacy-policy',
  template: `<div [innerHTML]="htmlContent"></div>`, // Render HTML content here
})
export class PrivacyPolicyComponent implements OnInit {
  htmlContent: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('privacy-policy.html', { responseType: 'text' })
      .subscribe(data => {
        this.htmlContent = data; // Load HTML content into the component
      }, error => {
        console.error('Error fetching privacy policy:', error);
      });
  }
}
