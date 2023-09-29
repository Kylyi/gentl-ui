// TYPES
import { IItem } from '~/libs/App/types/item.type'

export type ITab = IItem & {
  id: string | number
  label?: string
}

export function useTabsUtils() {
  return {}
}
