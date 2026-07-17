import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react'
import {
  createUserInputSchema,
  type CreateUserInput,
} from '@modern-web-stack/shared'

export interface UserFormValues {
  name: string
  email: string
}

export interface UserFormProps {
  initialValues?: UserFormValues
  submitLabel: string
  isSubmitting: boolean
  apiError?: string
  onSubmit: (values: CreateUserInput) => Promise<void>
}

const defaultValues: UserFormValues = {
  name: '',
  email: '',
}

export const UserForm = ({
  initialValues,
  submitLabel,
  isSubmitting,
  apiError,
  onSubmit,
}: UserFormProps): ReactElement => {
  const [values, setValues] = useState<UserFormValues>(
    initialValues ?? defaultValues,
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const mergedInitialValues = useMemo(
    () => initialValues ?? defaultValues,
    [initialValues],
  )

  useEffect(() => {
    setValues(mergedInitialValues)
  }, [mergedInitialValues])

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => {
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()

    const parsed = createUserInputSchema.safeParse(values)
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      setFieldErrors({
        name: errors.name?.[0] ?? '',
        email: errors.email?.[0] ?? '',
      })
      return
    }

    setFieldErrors({})
    await onSubmit(parsed.data)
  }

  return (
    <form
      className="user-form"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={values.name}
          onChange={handleChange}
        />
        {fieldErrors.name ? (
          <p className="field-error">{fieldErrors.name}</p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
        />
        {fieldErrors.email ? (
          <p className="field-error">{fieldErrors.email}</p>
        ) : null}
      </div>

      {apiError ? <p className="form-error">{apiError}</p> : null}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
