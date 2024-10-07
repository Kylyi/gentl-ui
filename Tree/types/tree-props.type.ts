import type { FuseOptions } from '@vueuse/integrations/useFuse'

// Types
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'
import type { ITreeNodeProps } from '~/components/Tree/types/tree-node-props.type'

export type ITreeProps = Omit<ITreeNodeProps, 'level' | 'path'> & {
  /**
   * Whether the tree should be collapsed on initialization
   */
  collapsedOnInit?: boolean | 'first'

  /**
   * Whether the connectors should be shown
   */
  connectors?: boolean

  /**
   * Class for the content wrapper
   */
  contentClass?: ClassType

  /**
   * D'n'D
   */
  dnd?: {
    /**
     * When true, the tree nodes will be draggable
     */
    enabled?: boolean

    /**
     * The class that is used for the drag and drop
     *
     * @default 'tree-move-handler'
     */
    dragClass?: string
  }

  /**
   * Configuration for fetching children nodes
   */
  fetchChildren?: { fnc: Function, mapKey: string }

  /**
   * Fuse options for the search
   */
  fuseOptions?: FuseOptions<any>

  /**
   * Maximum level for the nodes
   */
  maxLevel?: number

  /**
   * The tree nodes
   */
  nodes?: ITreeNode[]

  /**
   * When true, the search input will not be shown
   */
  noSearch?: boolean

  /**
   * Whether the collapse button should be hidden
   */
  preferCollapseBtnHidden?: boolean

  /**
   * Whether the scroll event should be propagated to the parent
   */
  wheelPropagation?: boolean

  /**
   * How the tree should be filtered
   * @option 'specific' - Only show nodes that match the search ~ will break
   * the structure if necessary
   * @example 'specific'
   *  - nodes:
   *   - name: 'a'
   *     - name: 'ab'
   *     - name: 'b'
   *       - name: 'c'
   *
   * - search: 'b'
   * - result:
   *     - name: 'ab'
   *     - name: 'b'
   *       - name: 'c'
   *
   * @option 'parent' - Will always traverse back to the level-0 parent while filtering
   * only relevant nodes
   * @example 'parent'
   *  - nodes:
   *   - name: 'a'
   *     - name: 'ab'
   *     - name: 'b'
   *       - name: 'c'
   *
   * - search: 'c'
   * - result:
   *   - name: 'a'
   *     - name: 'b'
   *       - name: 'c'
   * @default 'parent'
   */
  filterMode?: 'specific' | 'parent'
}
