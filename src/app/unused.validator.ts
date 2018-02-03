import { Directive } from '@angular/core';
import { AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms/';
import { HttpClient } from '@angular/common/http';
import { apiURL } from './url';


export function unusedValidator(http: HttpClient, type: string, lowercase = false): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value)
      return new Promise((res) => res(null));
    let value = lowercase ? control.value.toLowerCase() : control.value;
    return http.get(`${apiURL}/api/availability/${type}/${control.value}`).toPromise().then(
      (res: any) => {
        return res.availbile ? null : { 'availability': true };
      }
    );
  };
}
