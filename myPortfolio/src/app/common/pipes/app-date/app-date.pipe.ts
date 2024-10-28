import { Pipe, PipeTransform } from '@angular/core';
import { format, isMatch, parse } from 'date-fns';
import { AppSettingsService } from '../../services/app-settings/app-settings.service';

@Pipe({
  name: 'appDate',
  standalone: true
})
export class AppDatePipe implements PipeTransform {
  constructor(public appSetting: AppSettingsService) { }
  transform(value: any, returnformat?: any, xformat?: any): any {

    let prasedDate: any = '';
    let formatedDate: any = '';
    let dateViewFormat = this.appSetting.environment.dateViewFormat;
    let dateViewFormatWithTime =
      this.appSetting.environment.dateViewFormatWithTime;

    if (!value) {
      return '';
    }

    if (xformat) {
      prasedDate = parse(value, xformat, new Date());
      formatedDate = format(prasedDate, returnformat);
      return formatedDate;
    }
    let dateFormat = this.appSetting.environment.serverDateFormat;
    let dateFormatWithTime =
      this.appSetting.environment.serverDateFormatWithTime;
    let valueDateFormat = this.appSetting.environment.serverDateFormatWithTime;
    if (isMatch(value, dateFormat)) {
      valueDateFormat = dateFormat;
    } else if (isMatch(value, dateFormatWithTime)) {
      valueDateFormat = dateFormatWithTime;
    }

    if (returnformat) {
      if (returnformat === 'datetime') {
        prasedDate = parse(value, valueDateFormat, new Date());
        formatedDate = format(prasedDate, dateViewFormatWithTime);
        return formatedDate;
      } else {
        prasedDate = parse(value, valueDateFormat, new Date());
        formatedDate = format(prasedDate, returnformat);
        return formatedDate;
      }
    }

    prasedDate = parse(value, valueDateFormat, new Date());
    formatedDate = format(prasedDate, dateViewFormat);
    return formatedDate;
  }
}
