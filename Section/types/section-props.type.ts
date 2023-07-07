import { ClassType } from '~~/libs/App/types/class.type'

export interface ISectionProps {
  bordered?: boolean
  dense?: boolean
  headerClass?: ClassType
  sectionClass?: ClassType
  subtitle?: string
  subtitleClass?: ClassType
  title?: string | number | false | null
  titleClass?: ClassType
  titleFilled?: boolean
}
