import { HttpClient } from '@angular/common/http';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms/';
import { apiURL } from './url';

export function existenceValidator(
    http: HttpClient,
    type: string,
    lowercase = false,
    expected = false,
    old?: string
): AsyncValidatorFn {
    console.log(type, old);
    return (control: AbstractControl) => {
        if (!control.value) {
            return new Promise(res => res(null));
        }
        const value = lowercase ? control.value.toLowerCase() : control.value;
        if (old && value === old) {
            return Promise.resolve(null);
        }
        return http
            .get(`${apiURL}/api/availability/${type}/${control.value}`)
            .toPromise()
            .then((res: any) => {
                return res.available !== expected
                    ? null
                    : { availability: true };
            });
    };
}
