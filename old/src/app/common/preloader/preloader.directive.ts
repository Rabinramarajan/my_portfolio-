import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPreloader]',
})
export class PreloaderDirective implements OnInit {
  @Input('src') src: any;

  constructor(public elemRef: ElementRef, public renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.setAttribute(
      this.elemRef.nativeElement,
      'src',
      'assets/images/preloader.gif'
    );
    console.log(this.renderer);


    const image = new Image();
    image.onload = this.imageLoaded.bind(this);
    image.src = this.src;
  }

  imageLoaded() {
    this.renderer.setAttribute(this.elemRef.nativeElement, 'src', this.src);
  }

}
