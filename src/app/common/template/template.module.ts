import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPdfModule } from './view-pdf/view-pdf.module';
import { TypingAnimationComponent } from './typing-animation/typing-animation.component';



@NgModule({
  declarations: [
    TypingAnimationComponent
  ],
  imports: [
    CommonModule,
    ViewPdfModule,
  ],
  exports: [
    ViewPdfModule,
    TypingAnimationComponent
  ]
})
export class TemplateModule { }
