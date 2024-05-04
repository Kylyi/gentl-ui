// Types
import { type INotification } from '~/components/Notification/types/notification.type'

// Store
import { useNotificationStore } from '~/components/Notification/notification.store'

export function notify(
  title: string,
  type: INotification['type'] = 'info',
  options?: {
    timeout?: number
    subtitle?: string | string[]
    componentBelow?: INotification['componentBelow']
  }
) {
  const { timeout = 3000, subtitle, componentBelow } = options || {}

  const { addNotification } = useNotificationStore()

  return addNotification({
    title,
    subtitle,
    type,
    timeout,
    componentBelow,
  })
}
