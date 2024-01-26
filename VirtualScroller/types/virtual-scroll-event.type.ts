type VirtualItem = {
  index: number
  key: string
  size: number
}

export type IVirtualScrollEvent = {
  visibleStartItem: Pick<VirtualItem, 'index' | 'key' | 'size'>
  visibleEndItem: Pick<VirtualItem, 'index' | 'key' | 'size'>
}
