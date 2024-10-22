// Types
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'

export const treeCollapsedKey: InjectionKey<
  Ref<Record<string | number, boolean>>
> = Symbol('treeCollapsed')

export const treeHandleCollapseKey: InjectionKey<
  (node: ITreeNode, val?: boolean) => void | Promise<void>
> = Symbol('handleCollapse')
