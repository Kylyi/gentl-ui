// Types
import type { IVirtualScrollerProps } from '~/components/VirtualScroller/types/virtual-scroller-props.type'

export function useVirtualScrollerUtils(props: IVirtualScrollerProps) {
  const isLoading = ref(false)

  function binarySearch(arr: any[], scrollTop: number) {
    let low = 0
    let high = Array.isArray(arr) ? arr.length - 1 : Object.keys(arr).length - 1
    let mid

    while (low < high) {
      mid = Math.floor((high + low) / 2)
      // Check if x is present at middle position
      if (arr[mid] === scrollTop) {
        break
      } else if (arr[mid] > scrollTop) {
        high = mid - 1
      } else {
        low = mid + 1
      }
    }

    mid = Math.floor((high + low) / 2)

    if (scrollTop <= arr[mid]) {
      return mid
    } else {
      return mid + 1
    }
  }

  function findStartNode(
    scrollTop: number,
    nodePositions: number[],
    itemCount: number
  ) {
    let startRange = 0
    let endRange = itemCount - 1

    while (endRange !== startRange) {
      const middle = Math.floor((endRange - startRange) / 2 + startRange)
      if (
        nodePositions[middle] <= scrollTop &&
        nodePositions[middle + 1] > scrollTop
      ) {
        return middle
      }
      if (middle === startRange) {
        // edge case - start and end range are consecutive
        return endRange
      } else if (nodePositions[middle] <= scrollTop) {
        startRange = middle
      } else {
        endRange = middle
      }
    }

    return itemCount
  }

  function doesBrowserSupportPassiveScroll() {
    let passiveSupported = false

    try {
      const options = {
        get passive() {
          // This function will be called when the browser
          //   attempts to access the passive property.
          passiveSupported = true
          return false
        },
      }

      // @ts-expect-error
      window.addEventListener('test', null, options)
      // @ts-expect-error
      window.removeEventListener('test', null, options)
    } catch (err) {
      passiveSupported = false
    }

    return passiveSupported
  }

  return {
    binarySearch,
    findStartNode,
    doesBrowserSupportPassiveScroll,
  }
}
