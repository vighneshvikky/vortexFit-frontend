import { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormGroup } from '@angular/forms';

export function passwordStrengthValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    const isStrong =
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[\W]/.test(value) &&
      value.length >= 8;
    return isStrong ? null : { weakPassword: true };
  };
}

export function matchPassword(passwordKey: string, confirmPasswordKey: string) {
  return (formGroup: FormGroup) => {
    const password = formGroup.get(passwordKey);
    const confirmPassword = formGroup.get(confirmPasswordKey);

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  };
}
