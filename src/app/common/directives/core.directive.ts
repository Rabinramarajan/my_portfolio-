import { AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appButton]',
  standalone: true
})
export class AppButton implements AfterViewInit {
  @Input() appButton = "";
  @Input() name = "";
  @Input() src = "";
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {

  }
  ngAfterViewInit(): void {
    let iconHtml = '';
    if (this.name) {
      iconHtml = `<ion-icon name="${this.name}"></ion-icon>`;
    } else if (this.src) {
      iconHtml = `<ion-icon src="${this.src}"></ion-icon>`;
    }
    let html = `<div class="btn-text">${this.appButton}</div>${iconHtml}`
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', html);
  }
}
