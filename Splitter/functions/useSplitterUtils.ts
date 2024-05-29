export function useSplitterUtils() {
  function validatePanelReszie(
    newPrevPanelSize: number,
    newNextPanelSize: number,
    prevPanelIndex: number,
    panels: any[]
  ) {
    console.log('newPrevPanelSize', newPrevPanelSize)
    console.log('newNextPanelSize', newNextPanelSize)
    console.log('prevPanelIndex', prevPanelIndex)
    console.log('panels', panels)

    if (newPrevPanelSize > 100 || newPrevPanelSize < 0) {
      return false
    }

    if (newNextPanelSize > 100 || newNextPanelSize < 0) {
      return false
    }

    const prevPanelProps = panels[prevPanelIndex].props
    console.log('prevPanelProps', prevPanelProps['min-size'])

    if (
      prevPanelProps &&
      prevPanelProps['min-size'] &&
      prevPanelProps['min-size'] > newPrevPanelSize
    ) {
      return false
    }

    const newPanelProps = panels[prevPanelIndex + 1].props
    console.log('newPanelProps', newPanelProps['min-size'])

    if (
      newPanelProps &&
      newPanelProps['min-size'] &&
      newPanelProps['min-size'] > newNextPanelSize
    ) {
      return false
    }

    return true
  }

  return {
    validatePanelReszie,
  }
}
