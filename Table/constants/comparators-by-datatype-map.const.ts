// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

export const COMPARATORS_BY_DATATYPE_MAP: Record<
  ExtendedDataType,
  ComparatorEnum[]
> = {
  // String
  string: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.LIKE,
    ComparatorEnum.NOT_LIKE,
    ComparatorEnum.CONTAINS,
    ComparatorEnum.NOT_CONTAINS,
    ComparatorEnum.STARTS_WITH,
    ComparatorEnum.NOT_STARTS_WITH,
    ComparatorEnum.ENDS_WITH,
    ComparatorEnum.NOT_ENDS_WITH,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    ComparatorEnum.IN,
    ComparatorEnum.NOT_IN,
  ],

  // Number
  number: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    ComparatorEnum.IN,
    ComparatorEnum.NOT_IN,
  ],

  percent: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    ComparatorEnum.IN,
    ComparatorEnum.NOT_IN,
  ],

  int: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    ComparatorEnum.IN,
    ComparatorEnum.NOT_IN,
  ],

  long: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    ComparatorEnum.IN,
    ComparatorEnum.NOT_IN,
  ],

  double: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    ComparatorEnum.IN,
    ComparatorEnum.NOT_IN,
  ],

  // Date
  date: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.AGO,
    // ComparatorEnum.NOT_AGO,
    // ComparatorEnum.UNTIL,
    // ComparatorEnum.NOT_UNTIL,
    // ComparatorEnum.IS_EMPTY,
    // ComparatorEnum.NOT_IS_EMPTY,
  ],

  datetime: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.AGO,
    // ComparatorEnum.NOT_AGO,
    // ComparatorEnum.UNTIL,
    // ComparatorEnum.NOT_UNTIL,
    // ComparatorEnum.IS_EMPTY,
    // ComparatorEnum.NOT_IS_EMPTY,
  ],

  DateTime: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.AGO,
    // ComparatorEnum.NOT_AGO,
    // ComparatorEnum.UNTIL,
    // ComparatorEnum.NOT_UNTIL,
    // ComparatorEnum.IS_EMPTY,
    // ComparatorEnum.NOT_IS_EMPTY,
  ],

  yearMonth: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.AGO,
    // ComparatorEnum.NOT_AGO,
    // ComparatorEnum.UNTIL,
    // ComparatorEnum.NOT_UNTIL,
    // ComparatorEnum.IS_EMPTY,
    // ComparatorEnum.NOT_IS_EMPTY,
  ],

  timestamp: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.IS_EMPTY,
    // ComparatorEnum.NOT_IS_EMPTY,
  ],

  // Boolean
  boolean: [ComparatorEnum.IS, ComparatorEnum.NOT_IS],
  bool: [ComparatorEnum.IS, ComparatorEnum.NOT_IS],

  // Custom
  time: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.IS_EMPTY,
    // ComparatorEnum.NOT_IS_EMPTY,
  ],

  custom: [],

  // SECTION - Simple version of the above ~ usable for client-side filtering for example
  // String
  stringSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    // ComparatorEnum.LIKE,
    // ComparatorEnum.NOT_LIKE,
    ComparatorEnum.CONTAINS,
    ComparatorEnum.NOT_CONTAINS,
    ComparatorEnum.STARTS_WITH,
    ComparatorEnum.NOT_STARTS_WITH,
    ComparatorEnum.ENDS_WITH,
    ComparatorEnum.NOT_ENDS_WITH,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    // ComparatorEnum.IN,
    // ComparatorEnum.NOT_IN,
  ],

  // Number
  numberSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    // ComparatorEnum.IN,
    // ComparatorEnum.NOT_IN,
  ],
  percentSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,
  ],
  intSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    // ComparatorEnum.IN,
    // ComparatorEnum.NOT_IN,
  ],
  doubleSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    // ComparatorEnum.IN,
    // ComparatorEnum.NOT_IN,
  ],
  longSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,

    // Project specific
    // ComparatorEnum.IN,
    // ComparatorEnum.NOT_IN,
  ],

  // Date
  dateSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.AGO,
    // ComparatorEnum.NOT_AGO,
    // ComparatorEnum.UNTIL,
    // ComparatorEnum.NOT_UNTIL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,
  ],
  datetimeSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.AGO,
    // ComparatorEnum.NOT_AGO,
    // ComparatorEnum.UNTIL,
    // ComparatorEnum.NOT_UNTIL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,
  ],
  DateTimeSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.AGO,
    // ComparatorEnum.NOT_AGO,
    // ComparatorEnum.UNTIL,
    // ComparatorEnum.NOT_UNTIL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,
  ],
  fullDateTime: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.AGO,
    // ComparatorEnum.NOT_AGO,
    // ComparatorEnum.UNTIL,
    // ComparatorEnum.NOT_UNTIL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,
  ],
  fullDateTimeSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.AGO,
    // ComparatorEnum.NOT_AGO,
    // ComparatorEnum.UNTIL,
    // ComparatorEnum.NOT_UNTIL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,
  ],
  yearMonthSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    // ComparatorEnum.AGO,
    // ComparatorEnum.NOT_AGO,
    // ComparatorEnum.UNTIL,
    // ComparatorEnum.NOT_UNTIL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,
  ],
  timestampSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,
  ],

  // Boolean
  booleanSimple: [ComparatorEnum.IS, ComparatorEnum.NOT_IS],
  boolSimple: [ComparatorEnum.IS, ComparatorEnum.NOT_IS],

  // Custom
  timeSimple: [
    ComparatorEnum.EQUAL,
    ComparatorEnum.NOT_EQUAL,
    ComparatorEnum.GREATER_THAN,
    ComparatorEnum.GREATER_THAN_OR_EQUAL,
    ComparatorEnum.LESS_THAN,
    ComparatorEnum.LESS_THAN_OR_EQUAL,
    ComparatorEnum.IS_EMPTY,
    ComparatorEnum.NOT_IS_EMPTY,
  ],
  customSimple: [],
}
