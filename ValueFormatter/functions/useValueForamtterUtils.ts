import { config } from '~/config'

// Types
import type { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

// Functions
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'

// Constants
import { messages } from '~/utils/i18n'

export function useValueFormatterUtils() {
  // Utils
  const { locale } = useI18n()
  const { formatNumber } = useNumber()
  const { formatDate, formatTime } = useDateUtils()

  function getValueFormatterProps(props: IValueFormatter) {
    return reactivePick(props, [
      'value',
      'dataType',
      'format',
      'emptyValueString',
      'row',
      'emptyValue',
      'originalValue',
      'predictDataType',
      'resolveEnums',
    ])
  }

  function formatValue(
    value: any,
    row?: any,
    options: {
      dataType?: DataType
      format?: (row: any, value: any) => any
      emptyValue?: any
      predictDataType?: IValueFormatter['predictDataType']
      resolveEnums?: IValueFormatter['resolveEnums']
    } = {}
  ): any {
    const {
      format,
      emptyValue,
      predictDataType: _predictDataType,
      resolveEnums,
    } = options

    if (emptyValue === value) {
      return null
    }

    // We try to resolve enums when possible
    if (resolveEnums) {
      // Enums resolving makes sense only for strings and numbers
      if (typeof value === 'string' || typeof value === 'number') {
        const { translationKey } = resolveEnums
        const i18n =
          get(
            messages[locale.value as keyof typeof messages],
            translationKey
          ) || {}

        const enumKeys = Object.keys(i18n).filter(key => {
          const val = i18n[key]

          return typeof val === 'object'
        })

        const resolvedEnum = translateNestedKey(
          value.toString(),
          undefined,
          undefined,
          undefined,
          enumKeys.map(enumKey => `${translationKey}.${enumKey}`)
        )

        if (resolvedEnum !== value.toString()) {
          return resolvedEnum
        }
      }
    }

    // We try to predict the data type if it's not provided
    if (_predictDataType && !options.dataType) {
      options.dataType = predictDataType(_predictDataType)
    }

    // When array is provided, we format each value
    if (Array.isArray(value)) {
      return value
        .map(val => formatValue(val, row, options))
        .join(', ') as string
    }

    // When format function is provided, we use that
    if (format) {
      return format(row ?? {}, value)
    }

    // When value is null or undefined, we return empty string
    if (isNil(value)) {
      return ''
    }

    switch (options.dataType) {
      case 'number':
      case 'int':
      case 'numberSimple':
      case 'intSimple':
        return formatNumber(value)

      case 'date':
      case 'DateTime':
      case 'dateSimple':
      case 'DateTimeSimple':
        return formatDate(value, 'short')

      case 'datetime':
      case 'datetimeSimple':
        return formatDate(value, 'long')

      case 'timestamp':
      case 'timestampSimple':
        return formatDate(value, 'timestamp')

      case 'yearMonth':
      case 'yearMonthSimple':
        return formatDate(value, 'yearMonth')

      case 'time':
      case 'timeSimple':
        return formatTime(value)

      case 'boolean':
      case 'bool':
      case 'booleanSimple':
      case 'boolSimple':
        return JSON.parse(value) ? $t('yes') : $t('no')

      case 'string':
      case 'stringSimple':
      default:
        return typeof value === 'string' && config.removePipes
          ? value.replace(/\|/g, '')
          : value
    }
  }

  return {
    getValueFormatterProps,
    formatValue,
  }
}
