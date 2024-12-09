export function useBreadcrumbs(
  breadcrumbs: MaybeRefOrGetter<IBreadcrumb[]>,
  options?: { useLastBreadcrumbAsTitle?: boolean, title?: MaybeRefOrGetter<string> },
) {
  const { useLastBreadcrumbAsTitle = true, title } = options ?? {}

  const _breadcrumbs = computed(() => {
    return toValue(breadcrumbs)
  })

  if (title) {
    useHead({ title })
  } else if (useLastBreadcrumbAsTitle) {
    useHead({ title: _breadcrumbs.value.at(-1)?.label })
  }

  provide(breadcrumbsKey, _breadcrumbs)
}
