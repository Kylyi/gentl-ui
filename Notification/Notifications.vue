<script setup lang="ts">
// Store
import { useNotificationStore } from '~/components/Notification/notification.store'

type IProps = {
  placement?:
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right'
}

const props = withDefaults(defineProps<IProps>(), {
  placement: 'top-right',
})

// Store
const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)

// Layout
const notificationsEl = ref<HTMLDivElement>()
const notificationsClass = computed(() => {
  switch (props.placement) {
    case 'top-left':
      return 'top-20 left-5'

    case 'top':
      return 'top-20 left-50% translate-x--50%'

    case 'top-right':
      return 'top-20 right-10 sm:right-20'

    case 'left':
      return 'top-50% left-5 translate-y--50%'

    case 'right':
      return 'top-50% right-5 translate-y--50%'

    case 'bottom-left':
      return 'bottom-5 left-5'

    case 'bottom':
      return 'bottom-5 left-50% translate-x--50%'

    case 'bottom-right':
      return 'bottom-5 right-5'
  }
})
</script>

<template>
  <TransitionGroup
    ref="notificationsEl"
    name="list"
    tag="div"
    class="notifications"
    :class="notificationsClass"
    .hide="notificationStore.removeAllNotifications"
  >
    <NotificationRow
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @hide="notificationStore.removeNotification(notification.id)"
    />
  </TransitionGroup>
</template>

<style lang="scss">
.notifications {
  @applyflex flex-col gap-y-1 transition-transform fixed z-$zMax origin-center
    min-w-240px max-w-320px lt-xm:max-w-280px flex-center;

  // @applytop-20 left-50% translate-x--50%;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  @applyw-full;

  position: absolute !important;
}
</style>
