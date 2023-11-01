import { type FuseOptions } from '@vueuse/integrations/useFuse'
import { type ITreeNodeProps } from '~/components/Tree/types/tree-node-props.type'

// TYPES
import type { ITreeNode } from '~/components/Tree/types/tree-node.type'

export type ITreeProps = Omit<ITreeNodeProps, 'level'> & {
  collapsedOnInit?: boolean | 'first'
  connectors?: boolean
  contentClass?: ClassType
  fetchChildren?: { fnc: Function; mapKey: string }
  fuseOptions?: FuseOptions<any>
  maxLevel?: number
  nodes?: ITreeNode[]
  noSearch?: boolean
  preferCollapseBtnHidden?: boolean
  rowHeight?: string
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
