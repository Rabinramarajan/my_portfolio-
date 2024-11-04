import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { AppDatePipe } from '../pipes/app-date/app-date.pipe';

@Component({
  selector: 'scroll',
  standalone: true,
  imports: [],
  template: '<div class="ab"><div class="rel"><ng-content></ng-content></div></div>',
})
export class InnerScroll {

}

@Component({
  selector: 'row',
  standalone: true,
  imports: [],
  template: '<div class="row-container {{className}}"><div class="row {{rowClass}}" ><ng-content></ng-content></div></div>',
})
export class Row {
  @Input('className') className = "";
  @Input('rowClass') rowClass = "";
}

@Component({
  selector: 'view-label',
  standalone: true,
  imports: [AppDatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<div class="view-label" [class.label-flex]="flex">
    @if(type === ''){ @if (src !== '') {
    <ion-icon [src]="src"></ion-icon>
    } @if (name !== '') {
    <ion-icon [name]="name"></ion-icon>
    }
    <div class="d-flex gap-10">
      @if (label !== '') {
      <div class="view-label-text">{{ label }}</div>
      } @if(oldValue !=='' && value!==oldValue && oldDate=== false ){
      <div class="old-value ">
        <app-tooltip [value]="oldValue"></app-tooltip>
      </div>
      } @else if(oldValue !=='' && value !== oldValue && oldDate=== true ){
      <div class="old-value ">{{ oldValue | appDate }}</div>
      }
    </div>

    @if (value !== '' && ellipse === false) {
    <div class="view-label-value">{{ value ? value : '-' }}</div>
    } @else if(value !== '' && ellipse === true){
    <div class="view-label-value">
      <div class="text-ellipse ">
        <app-tooltip [value]="value"></app-tooltip>
      </div>
    </div>

    } @else if(status !== '' && value === ''){
    <div class="fow600 pt5 status-{{ status }}">{{ statusValue }}</div>
    } @else if(value === '' && status ==='') { - } } @if(type==='sub'){
    <div class=" align-items-end gap-5">
      <div class="view-label-text">{{ label }}:</div>
      <div class="view-label-value">{{ value ? value : '-' }}</div>
    </div>
    }
  </div>`,
})
export class ViewLabel {
  @Input('flex') flex = false;
  @Input('src') src = '';
  @Input('name') name = '';
  @Input('label') label = '';
  @Input('oldValue') oldValue = '';
  @Input('value') value = '';
  @Input('ellipse') ellipse = false;
  @Input('status') status = '';
  @Input('statusValue') statusValue = '';
  @Input('type') type = '';
  @Input('oldDate') oldDate = false;
}
