import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPdfComponent } from './view-pdf.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [ViewPdfComponent],
  entryComponents: [ViewPdfComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    PdfViewerModule
  ],
  exports: [
    ViewPdfComponent
  ]
})
export class ViewPdfModule { }
