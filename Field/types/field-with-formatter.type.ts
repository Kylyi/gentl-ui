// Types
import type { IFieldProps } from '~/components/Field/types/field-props.type'
import type { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

export type IFieldWithFormatterProps = {}
  & IFieldProps
  & Omit<IValueFormatter, 'value'>
