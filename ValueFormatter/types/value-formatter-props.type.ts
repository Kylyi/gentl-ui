// Types
import type { PredictDataTypeOptions } from '~/libs/App/functions/misc'

export type IValueFormatter = {
  value: any
  originalValue?: any
  dataType?: DataType

  /**
   * A custom formatter function
   */
  format?: (row: any, value: any) => any

  /**
   * When the `value` is the same as `emptyValue`, the `emptyValueString` will be shown instead
   */
  emptyValue?: any

  /**
   * When the value is `null`, `undefined`, <empty string> or <empty array> or the `emptyValue` prop is set to the value,
   * this value will be shown instead
   */
  emptyValueString?: any

  /**
   * When provided the options, it tries to predit the `dataType` and format it accordingly
   * When explicit `dataType` is provided, this is ignored
   */
  predictDataType?: PredictDataTypeOptions

  /**
   * When used with object-based data, the row object is passed to the formatter
   * as well
   */
  row?: any

  /**
   * We might want to try to resolve enum values automatically and dynamically
   *
   * NOTE - use case:
   * Let's have the following i18n structure: { x: { type: { self: "Type", 1: Active, 2: Inactive }}}
   * We have a `value` of `1`, which should be translated into `Active`
   * We can provide the `translationKey = 'x'` to automatically resolve it
   */
  resolveEnums?: {
    translationKey: string
  }
}
