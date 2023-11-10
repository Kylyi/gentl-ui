<script setup lang="ts">
import { IBreadcrumb } from './types/breadcrumb.type'

defineProps<{
  breadcrumbs: IBreadcrumb[]
}>()
</script>

<template>
  <Btn label="...">
    <Menu
      hide-header
      :no-arrow="false"
    >
      <template
        v-for="breadcrumb in breadcrumbs"
        :key="breadcrumb.to"
      >
        <Btn
          v-bind="breadcrumb"
          no-active-link
          color="!dark !dark:light"
          size="sm"
          no-uppercase
        />
      </template>
    </Menu>
  </Btn>
</template>
