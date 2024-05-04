// Types
import { type IItem } from '~/libs/Shared/types/item.type'

export type ITab = IItem & {
  id: string | number
  label?: string
}

export function useTabsUtils() {
  return {}
}
