<script setup lang="ts">
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables'

// UTILS
const { localesByCode } = useLocale()
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const localeCookie = useCookie('lang', { path: '/', sameSite: 'lax' })

const _locales = computed(() => locales.value as LocaleObject[])

function handleSetLocale(locale: LocaleObject, callback?: () => void) {
  const localePath = switchLocalePath(locale.code)
  console.log('Log ~ handleSetLocale ~ localePath:', localePath)
  history.replaceState(null, '', localePath)
  locale.value = locale.code
  localeCookie.value = locale.code

  useHead({ htmlAttrs: { lang: locale.code } })
  callback?.()
}
</script>

<template>
  <Btn
    id="lang-dropdown"
    :icon="`${localesByCode[localeCookie || locale]?.icon} w-6 h-6`"
    round
    no-hover-effect
    size="auto"
    w="7"
    h="7"
    name="locale-switch"
  >
    <Menu
      hide-header
      :no-arrow="false"
      content-class="flex-gap-y-2 !p-1"
    >
      <template #default="{ hide }">
        <Btn
          v-for="(_locale, idx) in _locales"
          :key="idx"
          :icon="`${_locale.icon} w-8 h-8`"
          size="auto"
          round
          @click="handleSetLocale(_locale, hide)"
        />
      </template>
    </Menu>
  </Btn>
</template>
