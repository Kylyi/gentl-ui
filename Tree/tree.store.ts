// Types
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'

// Injections
import { treeIdKey } from '~/components/Tree/provide/tree.provide'
import type { ITreeProps } from '~/components/Tree/types/tree-props.type'

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
    const nodes = ref<ITreeNode[]>([])

    // D'n'D
    const draggedItem = ref<IDraggedItem>()

    const dndOptions = ref({
      dragClass: 'tree-move-handler',
      enabled: true as boolean,
    } satisfies ITreeProps['dnd'])

    return {
      containerEl,
      dndOptions,
      draggedItem,
      nodes,
    }
  })()
}
