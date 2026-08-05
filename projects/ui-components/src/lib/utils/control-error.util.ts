import { NgControl } from '@angular/forms';

export type ValidateOn = 'change' | 'blur';

export const DEFAULT_ERROR_MESSAGES: Record<
  string,
  (error: unknown) => string
> = {
  required: () => 'This field is required.',
  email: () => 'Enter a valid email address.',
  minlength: (error) => {
    const e = error as { requiredLength: number };
    return `Must be at least ${e.requiredLength} characters.`;
  },
  maxlength: (error) => {
    const e = error as { requiredLength: number };
    return `Must be ${e.requiredLength} characters or fewer.`;
  },
  min: (error) => {
    const e = error as { min: number };
    return `Must be at least ${e.min}.`;
  },
  max: (error) => {
    const e = error as { max: number };
    return `Must be at most ${e.max}.`;
  },
  pattern: () => 'Value is in the wrong format.',
};

function hasInteracted(
  control: NonNullable<NgControl['control']>,
  validateOn: ValidateOn,
): boolean {
  return validateOn === 'blur'
    ? control.touched
    : control.touched || control.dirty;
}

export function controlHasError(
  ngControl: NgControl | null,
  validateOn: ValidateOn = 'change',
): boolean {
  const control = ngControl?.control;
  if (!control) return false;
  return !!(control.invalid && hasInteracted(control, validateOn));
}

export function controlIsRequired(ngControl: NgControl | null): boolean {
  const control = ngControl?.control;
  if (!control?.validator) return false;
  const result = control.validator({} as never);
  return !!result?.['required'];
}

export function resolveControlErrorMessage(
  ngControl: NgControl | null,
  options: {
    explicitError?: string | null;
    customMessages?: Record<string, string>;
    validateOn?: ValidateOn;
  } = {},
): string | null {
  const { explicitError, customMessages = {}, validateOn = 'change' } =
    options;

  if (explicitError) return explicitError;

  const control = ngControl?.control;
  if (!control?.errors || !hasInteracted(control, validateOn)) return null;

  const [key] = Object.keys(control.errors);
  if (!key) return null;

  if (customMessages[key]) return customMessages[key];

  const formatter = DEFAULT_ERROR_MESSAGES[key];
  if (formatter) return formatter(control.errors[key]);

  return 'This field has an invalid value.';
}
