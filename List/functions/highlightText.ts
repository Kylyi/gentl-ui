import * as Fuse from 'fuse.js'

// Types
import type { IItem } from '~/libs/Shared/types/item.type'

/**
 *
 * @param fuseSearchResult result you get from useFuse (fuzzy search)
 * @param highlightClassName optionally, you can set the class for each of the matched parts
 * @returns a string of HTML code with highlighted parts, check example below to see how it should be used in template
 *
 * @example <span v-html="<whatever_is_returned>" />
 */
export function highlight<T = IItem>(
  fuseSearchResult: Array<Fuse.FuseResult<T>>,
  options?: {
    keys?: Fuse.FuseOptionKey<any>[]
    highlightClassName?: string
    searchValue?: string

    /**
     * When `displayKey` is provided, the highlightted text will be combined with
     * value from the `displayKey` property of the item.
     *
     * So basically, let's say we have an item:
     * { name: 'John Doe', nameLocalized: 'Джон До' }
     * we set `displayKey` to 'nameLocalized'
     * and we search for 'Джон', then the highlighted text will be 'Джон Doe'
     */
    displayKeys?: string[]

    itemGetter?: (item: T) => T
  }
) {
  const {
    keys = [],
    highlightClassName = 'fuse-highlighted',
    displayKeys,
    itemGetter
  } = options || {}
  let hasExactMatch = false

  const generateHighlightedText = (
    highlighted: string,
    inputText = '',
    regions: readonly Fuse.RangeTuple[],
    displayText?: string
  ) => {
    let content = ''
    let nextUnhighlightedRegionStartingIndex = 0
    const text = displayText ?? inputText

    regions.forEach(region => {
      const startIndex = region[0]
      const lastRegionNextIndex = region[1] + 1 // We add +1 to include the last character of the region

      content += [
        // We add the unhighlighted part
        text.substring(nextUnhighlightedRegionStartingIndex, startIndex),

        // We higlight the matched part
        `<span class="${highlightClassName}">`,
        text.substring(startIndex, lastRegionNextIndex),
        '</span>',
      ].join('')

      nextUnhighlightedRegionStartingIndex = lastRegionNextIndex
    })

    content += text.substring(nextUnhighlightedRegionStartingIndex)

    return `${highlighted.trim()} ${content}`
  }

  const highlightedResult = fuseSearchResult
    .filter(({ matches }) => matches && matches.length)
    .map(({ item, matches, score }) => {
      let highlighted = ''

      keys.forEach((key, idx) => {
        const match = matches?.find(match => match.key === key)
        const displayKey = displayKeys?.[idx]
        const _item = itemGetter?.(item) ?? item
        const displayText = get(_item, displayKey ?? key as string)


        highlighted = match
          ? generateHighlightedText(
              highlighted,
              match.value,
              match.indices,
              displayText
            )
          : `${highlighted} ${displayText}`
      })

      hasExactMatch = hasExactMatch || score! <= Number.EPSILON

      return { item, highlighted }
    })

  return { highlightedResult, hasExactMatch }
}
