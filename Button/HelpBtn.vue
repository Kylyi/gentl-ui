<script setup lang="ts">
// TYPES
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'

// COMPOSITION FUNCTIONS
import { useMenuUtils } from '~/components/Menu/functions/useMenuUtils'

type IHelpBtnProps = {
  menuClass?: ClassType
} & IMenuProps

const props = defineProps<IHelpBtnProps>()

// UTILS
const { getMenuProps } = useMenuUtils()

const menuProps = getMenuProps(props)
</script>

<template>
  <Btn
    preset="HELP"
    size="sm"
    @click.stop.prevent
    @mousedown.stop.prevent
  >
    <Menu
      v-bind="menuProps"
      :title="menuProps.title ?? $t('help')"
      :class="menuClass"
      w="70"
    >
      <slot />
    </Menu>
  </Btn>
</template>
