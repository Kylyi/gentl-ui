<script setup lang="ts">
import { useNotificationStore } from '~/components/Notification/notification.store'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
</script>

<template>
  <TransitionGroup
    name="list"
    tag="div"
    class="notifications"
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
  --apply: flex flex-col gap-y-1 transition-transform fixed z-$zMax origin-center
    min-w-240px max-w-320px lt-xm:max-w-280px flex-center;

  --apply: top-20 left-50% translate-x--50%;
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
  --apply: w-full;

  position: absolute !important;
}
</style>
