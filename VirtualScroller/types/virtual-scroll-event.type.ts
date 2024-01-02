import type { VirtualItem } from '@tanstack/vue-virtual'

export type IVirtualScrollEvent = {
  visibleStartItem: Pick<VirtualItem, 'index' | 'key' | 'size'>
  visibleEndItem: Pick<VirtualItem, 'index' | 'key' | 'size'>
}
