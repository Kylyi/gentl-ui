// Types
import type { VNode } from 'vue'
import type { ISplitterProps } from '~/components/Splitter/types/splitter.type'

export function useSplitterUtils(props: ISplitterProps) {
  // Functions
  function validatePanelReszie(
    newPrevPanelSize: number,
    newNextPanelSize: number,
    prevPanelMinSize: number,
    nextPanelMinSize: number
  ) {
    if (newPrevPanelSize > 100 || newPrevPanelSize < 0) {
      return false
    }

    if (newNextPanelSize > 100 || newNextPanelSize < 0) {
      return false
    }

    if (prevPanelMinSize && prevPanelMinSize > newPrevPanelSize) {
      return false
    }

    if (nextPanelMinSize && nextPanelMinSize > newNextPanelSize) {
      return false
    }

    return true
  }

  return {
    // Functions
    validatePanelReszie,
  }
}
