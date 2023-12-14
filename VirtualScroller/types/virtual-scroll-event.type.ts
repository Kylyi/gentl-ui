import type { VirtualItem } from '@tanstack/vue-virtual'

export type IVirtualScrollEvent = {
  visibleStartItem: VirtualItem
  visibleEndItem: VirtualItem
}
