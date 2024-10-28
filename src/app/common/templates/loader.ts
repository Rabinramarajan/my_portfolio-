import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  template: `
    <div class="loader-wrapper">
  <img src="image/Animation - 1730058781606.gif" alt="Loading..." class="loader-gif" />
</div>

    `
})

export class Loader implements OnInit {

  constructor() {

  }

  ngOnInit(): void {

  }
}
