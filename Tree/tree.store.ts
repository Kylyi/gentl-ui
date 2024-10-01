// Types
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'

// Injections
import { treeIdKey } from '~/components/Tree/provide/tree.provide'

type IDraggedItem = {
  item: ITreeNode
  pos: { x: number, y: number }
  dropIndicatorPos?: {
    x: number
    y: number
    width: number
  }
  dropDirection?: 'above' | 'below'
  currentPath?: string
  newPath?: string
}

export function useTreeStore(treeId?: string) {
  const _treeId = injectLocal(treeIdKey, treeId ?? useId())

  return defineStore(`tree.${_treeId}`, () => {
    const containerEl = ref<HTMLDivElement>()
    const draggedItem = ref<IDraggedItem>()
    const nodes = ref<ITreeNode[]>([])

    return { containerEl, draggedItem, nodes }
  })()
}
