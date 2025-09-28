import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function minimumAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dobValue = control.value;
    if (!dobValue) return null;

    const dob = new Date(dobValue);
    const today = new Date();

    const age = today.getFullYear() - dob.getFullYear();
    const hasHadBirthday =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    const actualAge = hasHadBirthday ? age : age - 1;

    return actualAge >= minAge ? null : { tooYoung: { requiredAge: minAge, actualAge } };
  };
}
