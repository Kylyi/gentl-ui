import { Component } from 'vue'

export type INotification = {
  /**
   * Unique ID of the notification
   */
  id: number

  /**
   * Icon to display
   */
  icon?: string

  /**
   * Title of the notification
   */
  title: string

  /**
   * Subtitle of the notification
   */
  subtitle?: string

  /**
   * Type of the notification
   */
  type?: 'primary' | 'secondary' | 'positive' | 'warning' | 'negative' | 'info'

  /**
   * Timeout in milliseconds
   */
  timeout?: number

  /**
   * Whether to use counter
   */
  counter?: number

  /**
   * We can inject our own component at the bottom of the notification
   */
  componentBelow?: {
    component: Component
    props: Record<string, any>
  }
}
