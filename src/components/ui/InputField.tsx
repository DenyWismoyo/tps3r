import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';

interface BaseFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export interface InputFieldProps
  extends BaseFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'required'> {}

export function InputField({
  id,
  label,
  hint,
  error,
  required,
  className = '',
  ...rest
}: InputFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">
        {label}
        {required ? <span className="form-label__req" aria-hidden="true">*</span> : null}
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={['input', error ? 'input--error' : '', className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error ? (
        <span id={`${id}-error`} className="form-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="form-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export interface TextareaFieldProps
  extends BaseFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'required'> {}

export function TextareaField({
  id,
  label,
  hint,
  error,
  required,
  className = '',
  ...rest
}: TextareaFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">
        {label}
        {required ? <span className="form-label__req" aria-hidden="true">*</span> : null}
      </label>
      <textarea
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={['textarea', error ? 'textarea--error' : '', className]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
      {error ? (
        <span id={`${id}-error`} className="form-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="form-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps
  extends BaseFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'required'> {
  options: readonly SelectOption[];
  placeholder?: string;
}

export function SelectField({
  id,
  label,
  hint,
  error,
  required,
  options,
  placeholder,
  className = '',
  ...rest
}: SelectFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">
        {label}
        {required ? <span className="form-label__req" aria-hidden="true">*</span> : null}
      </label>
      <select
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={['select', error ? 'select--error' : '', className].filter(Boolean).join(' ')}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <span id={`${id}-error`} className="form-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="form-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export interface CheckboxFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: ReactNode;
}

export function CheckboxField({ id, label, ...rest }: CheckboxFieldProps) {
  return (
    <label htmlFor={id} className="checkbox-row">
      <input id={id} type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}
