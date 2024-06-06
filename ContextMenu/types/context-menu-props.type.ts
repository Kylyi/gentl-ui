// Types import
import type { IKeyboardShortcutProps } from '~/components/KeyboardShortcut/types/keyboard-shortcut-props.type'

// Types
type IContextPropsTeleport = {
  to?: string
  disabled?: boolean
}

export type IContextMenuProps = {
  teleport?: IContextPropsTeleport
  isSub?: boolean

  /** CSS classes for ContextMenu window */
  menuClasses?: string
}

export type IContextMenuItemProps = {
  label?: string
  icon?: string
  disabled?: boolean

  /** background color of context menu item on hover - dark.500 */
  hoverBgColor?: string

  /** background color of context menu item - dark.500 */
  hoverTextColor?: string

  /** props for `KeyboardShortcut` */
  shortcut?: IKeyboardShortcutProps
}

export type IContextMenuItemSubProps = {
  menu?: IContextMenuProps
  menuItem?: IContextMenuItemProps
}
