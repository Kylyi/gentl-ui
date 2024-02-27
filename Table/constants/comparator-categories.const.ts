// Models
import { config } from '~/config'
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

export const NON_VALUE_COMPARATORS = [
  ComparatorEnum.IS_EMPTY,
  ComparatorEnum.NOT_IS_EMPTY,
  ...config.dataTypes.nonValueComparators,
]

export const BOOLEANISH_COMPARATORS = [
  ComparatorEnum.IS,
  ComparatorEnum.NOT_IS,
  ...config.dataTypes.booleanishComparators,
]

export const SELECTOR_COMPARATORS = [
  ComparatorEnum.IN,
  ComparatorEnum.NOT_IN,
  ...config.dataTypes.selectorComparators,
]
