<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import { config } from '~/components/config/components-config'

// Utils
const { localesByCode } = useLocale()
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const localeCookie = useCookie('lang', {
  domain: config.domain,
})

const _locales = computed(() => locales.value as LocaleObject[])

function handleSetLocale(_locale: LocaleObject, callback?: () => void) {
  const localePath = switchLocalePath(_locale.code)
  history.replaceState(null, '', localePath)
  locale.value = _locale.code
  localeCookie.value = _locale.code

  // useHead({ htmlAttrs: { lang: locale.code } })
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
    <Menu :no-arrow="false">
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
