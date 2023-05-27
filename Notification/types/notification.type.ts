export type INotification = {
  id: number
  icon?: string
  title: string
  subtitle?: string
  type?: 'primary' | 'secondary' | 'positive' | 'warning' | 'negative' | 'info'
  timeout?: number
  counter?: number
}
