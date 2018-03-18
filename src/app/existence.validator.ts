import { Directive } from '@angular/core';
import { AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms/';
import { HttpClient } from '@angular/common/http';
import { apiURL } from './url';

export function existenceValidator(http: HttpClient, type: string, lowercase = false, expected = false, old?): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value)
      return new Promise((res) => res(null));
    let value = lowercase ? control.value.toLowerCase() : control.value;
    if (old && value === old)
      return Promise.resolve(null);
    return http.get(`${apiURL}/api/availability/${type}/${control.value}`).toPromise().then(
      (res: any) => {
        return res.available !== expected ? null : { 'availability': true };
      }
    );
  };
}
