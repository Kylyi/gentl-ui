// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

export const NON_VALUE_COMPARATORS = [
  ComparatorEnum.IS_EMPTY,
  ComparatorEnum.NOT_IS_EMPTY,
]

export const BOOLEANISH_COMPARATORS = [ComparatorEnum.IS, ComparatorEnum.NOT_IS]

export const SELECTOR_COMPARATORS = [
  ComparatorEnum.IN,
  ComparatorEnum.NOT_IN,
  ComparatorEnum.HAS_SOME,
]
