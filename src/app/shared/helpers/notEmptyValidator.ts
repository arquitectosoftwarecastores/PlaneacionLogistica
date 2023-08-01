import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function notEmptyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    // If the field is empty or contains only white spaces, return a validation error
    if (!value || value.trim() === '') {
      return { 'notEmpty': true };
    }
    return null; // Validation passes if the field is not empty
  };
}
