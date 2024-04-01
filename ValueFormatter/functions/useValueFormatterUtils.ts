import { config } from '~/components/config/components-config'

// Types
import type { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

// Functions
import { useNumber } from '~/components/Inputs/NumberInput/functions/useNumber'
import { useDuration } from '~/components/Inputs/DurationInput/functions/useDuration'

// Constants
import { messages } from '~/utils/i18n'

export function useValueFormatterUtils() {
  // Utils
  const { locale } = useI18n()
  const { formatDuration } = useDuration()
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
      'previousValue',
      'predictDataType',
      'resolveEnums',
    ])
  }

  function formatValue(
    value: any,
    row?: any,
    options: {
      dataType?: ExtendedDataType
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

      case 'duration':
      case 'durationSimple':
        // eslint-disable-next-line no-case-declarations
        const { val, formatted, unit } = formatDuration(value)

        return `${formatted} ${$t(`general.${unit}`, val)}`

      case 'date':
      case 'dateSimple':
        return formatDate(value, 'short')

      case 'datetime':
      case 'datetimeSimple':
      case 'DateTime':
      case 'DateTimeSimple':
        return formatDate(value, 'long')

      case 'fullDateTime':
      case 'fullDateTimeSimple':
        return formatDate(value, 'longWithSeconds')

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
        return JSON.parse(value) ? $t('general.yes') : $t('general.no')

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
