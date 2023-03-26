import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPdfModule } from './view-pdf/view-pdf.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ViewPdfModule,
  ],
  exports: [
    ViewPdfModule
  ]
})
export class TemplateModule { }
