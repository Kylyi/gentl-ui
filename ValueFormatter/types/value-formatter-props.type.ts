export interface IValueFormatter {
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
   * When used with object-based data, the row object is passed to the formatter
   * as well
   */
  row?: any
}
