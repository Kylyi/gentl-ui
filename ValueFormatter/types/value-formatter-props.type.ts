export interface IValueFormatter {
  value: any
  dataType?: DataType
  format?: (row: any, value: any) => any

  // When the value is `null`, `undefined`, <empty string> or <empty array>,
  // this value will be shown instead
  emptyValueString?: any

  /**
   * When used with object-based data, the row object is passed to the formatter
   * as well
   */
  row?: any
}
