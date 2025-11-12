import { Component, OnInit, AfterViewInit, ElementRef, inject } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics/analytics';
import { AnimationsService } from '../../../services/animations/animations.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { DynamicButtonComponent } from '../../general/dynamic-button/dynamic-button.component';

@Component({
  selector: 'app-contact',
  imports: [CarouselModule, TranslateModule, DynamicButtonComponent],
  providers: [
    TranslateService
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, AfterViewInit {

  private readonly analytics = inject(AnalyticsService);
  private readonly animations = inject(AnimationsService);
  private readonly elementRef = inject(ElementRef);

  constructor(

  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initAnimations();
  }

  private initAnimations(): void {
    const contactSection = this.elementRef.nativeElement;

    // Animar contenedor del título
    const titleContainer = contactSection.querySelector('.mb-4');
    if (titleContainer) {
      this.animations.observeElement(titleContainer, {
        type: 'fadeInDown',
        duration: 1000
      });
    }

    // Animar título principal con typewriter
    const mainTitle = contactSection.querySelector('.contact-title');
    if (mainTitle) {
      this.animations.observeElement(mainTitle, {
        type: 'typewriter',
        delay: 500
      });
    }

    // Animar párrafo de descripción
    const description = contactSection.querySelector('p');
    if (description) {
      this.animations.observeElement(description, {
        type: 'morphIn',
        duration: 1200,
        delay: 2500
      });
    }

    // Animar botón de contacto
    const contactButton = contactSection.querySelector('.contact-btn');
    if (contactButton) {
      this.animations.observeElement(contactButton.parentElement as HTMLElement, {
        type: 'scaleIn',
        duration: 800,
        delay: 3500
      });

      // Añadir efectos hover especiales al botón
      this.animations.addHoverEffects(contactButton as HTMLElement, ['lift', 'glow']);
    }
  }
}
