import { Directive, ElementRef, OnInit, Input, inject, NgZone } from '@angular/core';
import { shouldReduceEffects } from './animation-utils';

/**
 * Typewriter Effect Directive
 * Animates text character-by-character with cursor
 */
@Directive({
  selector: '[appTypewriter]',
  standalone: true,
})
export class TypewriterDirective implements OnInit {
  private readonly el = inject(ElementRef);
  private readonly ngZone = inject(NgZone);
  @Input() typewriterDelay = 50;
  private shouldDisable = shouldReduceEffects();

  ngOnInit() {
    const element = this.el.nativeElement;
    const originalText = element.textContent;

    if (this.shouldDisable || !originalText) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      element.textContent = '';
      let index = 0;

      const type = () => {
        if (index < originalText.length) {
          element.textContent += originalText[index];
          index++;
          setTimeout(type, this.typewriterDelay);
        }
      };

      type();
    });
  }
}
