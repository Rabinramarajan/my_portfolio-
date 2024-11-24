import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit {

  @Input() type: any = '';
  @Input() loadingValues: any = '';

  constructor() {

  }

  ngOnInit(): void {

  }

  getReversedCharacters(): string[] {
    // Split the string into an array, reverse it, and return
    return this.loadingValues.split('').reverse();
  }
}
