// REGEX
import { SummaryEnum } from '~/libs/App/data/enums/summary.enum'
import { stringToFloat } from '~/libs/App/data/regex/string-to-float.regex'

export type INumberOptions = {
  localeIso?: string
  intlOptions?: Intl.NumberFormatOptions
}

const defaultIntlOptions: Intl.NumberFormatOptions = {
  maximumFractionDigits: 2,
  useGrouping: true,
}

export function useNumber(localeRef?: MaybeRefOrGetter<string>) {
  const { currentLocaleIso } = useLocale()
  const { t } = useI18n()

  /**
   * Parses a number from a string
   */
  const parseNumber = (valueRef?: MaybeRefOrGetter<string | number | null>) => {
    const val = String(toValue(valueRef))
    if (!val) {
      return 0
    }

    let result = val
      .replace(new RegExp(`\\${separators.value.thousandSeparator}`, 'g'), '')
      .replace(new RegExp(`\\${separators.value.decimalSeparator}`), '.')

    if (separators.value.thousandSeparator.charCodeAt(0) === 160) {
      result = result.replace(/ /g, '')
    }
    result = stringToFloat(result) || '0'

    return Number.isNaN(+result) ? 0 : +result
  }

  /**
   * Formats a number to a locale-aware string
   */
  const formatNumber = (
    valueRef?: MaybeRefOrGetter<number | string | null>,
    options: INumberOptions = {}
  ) => {
    const val = toValue(valueRef)
    if (val === null || val === undefined) {
      return ''
    }

    const { localeIso, intlOptions } = options
    const usedLocale = localeIso || currentLocaleIso.value
    const usedIntlOptions = intlOptions || defaultIntlOptions

    return Intl.NumberFormat(usedLocale, usedIntlOptions).format(+val)
  }

  /**
   * Formats bytes into more readable format
   */
  function formatBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 B'
    }

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${formatNumber(bytes / k ** i)} ${sizes[i]}`
  }

  const separators = computed(() => {
    const usedLocale = toValue(localeRef) || currentLocaleIso.value

    const helperVal = Intl.NumberFormat(usedLocale).formatToParts(1111.1)
    const thousandSeparator = helperVal[1].value
    const decimalSeparator = helperVal[3].value

    return {
      thousandSeparator,
      decimalSeparator,
    }
  })

  const summaryMetricOptions = computed(() => {
    return [
      { id: SummaryEnum.SUM, label: t(`summaryEnum.${SummaryEnum.SUM}`) },
      {
        id: SummaryEnum.AVERAGE,
        label: t(`summaryEnum.${SummaryEnum.AVERAGE}`),
      },
      { id: SummaryEnum.MEDIAN, label: t(`summaryEnum.${SummaryEnum.MEDIAN}`) },
      { id: SummaryEnum.COUNT, label: t(`summaryEnum.${SummaryEnum.COUNT}`) },
    ]
  })

  return {
    separators,
    summaryMetricOptions,
    parseNumber,
    formatNumber,
    formatBytes,
  }
}
