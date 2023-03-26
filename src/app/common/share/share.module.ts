import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplateModule } from '../template/template.module';


@NgModule({
  declarations: [ HeaderComponent,
    FooterComponent],
  imports: [
    CommonModule,
    NgbModule,
    RouterModule,
    NgbDropdownModule,
    FormsModule,
    ReactiveFormsModule,
    TemplateModule
  ],
  exports: [HeaderComponent,FooterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShareModule { }
