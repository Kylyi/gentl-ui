// @unocss-include
import { config } from '~/components/config/components-config'

// Components
import TextInput from '~/components/Inputs/TextInput/TextInput.vue'
import NumberInput from '~/components/Inputs/NumberInput/NumberInput.vue'
import DateInput from '~/components/Inputs/DateInput/DateInput.vue'
import Toggle from '~/components/Toggle/Toggle.vue'
import TimeInput from '~/components/Inputs/TimeInput/TimeInput.vue'
import DurationInput from '~/components/Inputs/DurationInput/DurationInput.vue'
import CurrencyInput from '~/components/Inputs/CurrencyInput/CurrencyInput.vue'

const TEXT_INPUT = {
  component: markRaw(TextInput),
  props: {} as ComponentProps<typeof TextInput>,
  icon: 'i-mi-text',
}

const NUMBER_INPUT = {
  component: markRaw(NumberInput),
  props: {} as ComponentProps<typeof NumberInput>,
  icon: 'i-ant-design:number-outlined',
}

const CURRENCY_INPUT = {
  component: markRaw(CurrencyInput),
  props: {} as ComponentProps<typeof CurrencyInput>,
  icon: 'i-grommet-icons:currency',
}

const DURATION_INPUT = {
  component: markRaw(DurationInput),
  props: {
    format: '0,0.00',
  } as ComponentProps<typeof DurationInput>,
  icon: 'i-carbon:time',
}

const DATE_INPUT = {
  component: markRaw(DateInput),
  props: {
    format: 'YYYY-MM-DD',
  } as ComponentProps<typeof DateInput>,
  icon: 'i-system-uicons:calendar-date',
}

const BOOLEAN_INPUT = {
  component: markRaw(Toggle),
  props: {} as ComponentProps<typeof Toggle>,
  icon: 'i-carbon:boolean',
}

const TIME_INPUT = {
  component: markRaw(TimeInput),
  props: {} as ComponentProps<typeof TimeInput>,
  icon: 'i-ion:time-outline',
}

const custom = {
  component: markRaw(TextInput),
  props: {},
  icon: 'i-carbon:unknown',
}

const INPUT_BY_DATATYPE = {
  // String
  string: TEXT_INPUT,

  // Number
  number: NUMBER_INPUT,
  percent: NUMBER_INPUT,
  int: NUMBER_INPUT,
  long: NUMBER_INPUT,
  double: NUMBER_INPUT,

  // Currency
  currency: CURRENCY_INPUT,

  // Duration
  duration: DURATION_INPUT,

  // Date
  date: DATE_INPUT,
  datetime: DATE_INPUT,
  yearMonth: DATE_INPUT,
  timestamp: DATE_INPUT,
  DateTime: DATE_INPUT,
  fullDateTime: DATE_INPUT,

  // Boolean
  boolean: BOOLEAN_INPUT,
  bool: BOOLEAN_INPUT,

  // Time
  time: TIME_INPUT,

  // Custom
  custom,

  // SECTION: Simple versions
  // String
  stringSimple: TEXT_INPUT,

  // Number
  numberSimple: NUMBER_INPUT,
  percentSimple: NUMBER_INPUT,
  intSimple: NUMBER_INPUT,
  longSimple: NUMBER_INPUT,
  doubleSimple: NUMBER_INPUT,

  // Currency
  currencySimple: CURRENCY_INPUT,

  // Duration
  durationSimple: DURATION_INPUT,

  // Date
  dateSimple: DATE_INPUT,
  datetimeSimple: DATE_INPUT,
  yearMonthSimple: DATE_INPUT,
  timestampSimple: DATE_INPUT,
  DateTimeSimple: DATE_INPUT,
  fullDateTimeSimple: DATE_INPUT,

  // Boolean
  booleanSimple: BOOLEAN_INPUT,
  boolSimple: BOOLEAN_INPUT,

  // Time
  timeSimple: TIME_INPUT,

  // Custom
  customSimple: custom,

  // App specific
  ...config.dataTypes.inputs,
} as const

export function getInputByDataType<T extends ExtendedDataType>(
  dataType: T,
  options?: {
    props?: Partial<ComponentProps<(typeof INPUT_BY_DATATYPE)[T]['component']>>
  },
) {
  const { props } = options ?? {}

  const input = INPUT_BY_DATATYPE[dataType]

  // We merge the props if some are passed
  if (props) {
    merge(input.props, props)
  }

  return INPUT_BY_DATATYPE[dataType]
}
