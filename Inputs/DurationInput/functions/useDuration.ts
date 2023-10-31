// COMPOSITION FUNCTIONS

import {
useNumber,
type INumberOptions,
} from '~/components/Inputs/NumberInput/functions/useNumber'

export type DurationUnit =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year'
export type IDurationOptions = INumberOptions & { unit?: DurationUnit }

export const MODIFIER_BY_UNIT: Record<DurationUnit, number> = {
  millisecond: 1,
  second: $duration(1, 'second').as('ms'),
  minute: $duration(1, 'minute').as('ms'),
  hour: $duration(1, 'hour').as('ms'),
  day: $duration(1, 'day').as('ms'),
  week: $duration(1, 'week').as('ms'),
  month: $duration(1, 'month').as('ms'),
  year: $duration(1, 'year').as('ms'),
}

export function useDuration() {
  const { parseNumber, formatNumber } = useNumber()

  const formatDuration = (
    valueRef?: MaybeRefOrGetter<number | string | null>,
    options: IDurationOptions = {}
  ): { val: number; unit: IDurationOptions['unit']; formatted: string } => {
    let val = toValue(valueRef)

    if (isNil(val) || val === '') {
      return {
        val: 0,
        unit: 'second',
        formatted: '',
      }
    }

    if (typeof val !== 'number') {
      val = parseNumber(val)
    }

    return getDuration(val, options.unit)
  }

  const getDuration = (
    value: number,
    unit?: IDurationOptions['unit']
  ): { val: number; unit: IDurationOptions['unit']; formatted: string } => {
    if (!unit) {
      if ($duration(value).as('second') <= 1) {
        unit = 'millisecond'
      } else if ($duration(value).as('second') <= 30) {
        unit = 'second'
      } else if ($duration(value).as('minute') <= 30) {
        unit = 'minute'
      } else if ($duration(value).as('hour') < 24) {
        unit = 'hour'
      } else {
        unit = 'day'
      }
    }

    const val = $duration(value).as(unit)

    return { val, unit, formatted: formatNumber(val) }
  }

  return {
    formatDuration,
    getDuration,
  }
}
