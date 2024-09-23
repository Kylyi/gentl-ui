// Functions
import { defineStore } from 'pinia'

// Models
import { OnboardingModel } from '~/components/Onboarding/models/onboarding.model';

export const useOnboardingStore = defineStore(
  'onboarding',
  () => {
    const onboardingsByName = ref<Record<
      string,
      OnboardingModel
      >>({})
    const lastIndexByName = ref<Record<string, number>>({})

    const activeOnboarding = computed(() => {
      return Object.values(onboardingsByName.value).find(onboarding => onboarding.isActive)
    })

    function addTour(onboarding: OnboardingModel) {
      onboardingsByName.value = {
        ...onboardingsByName.value,
        [onboarding.name]: onboarding,
      }

      // Add lastIndex if it didn't exit
      if(!(onboarding.name in lastIndexByName.value)){
        lastIndexByName.value[onboarding.name] = 0
      }

      // If last step cannot be skipped to, go to earlier step
      while(
        !onboarding.steps[lastIndexByName.value[onboarding.name]].canBeSkippedTo &&
        lastIndexByName.value[onboarding.name] > 0
      )
        {
        lastIndexByName.value[onboarding.name]--
      }
    }

    function startTour(name: OnboardingModel['name']){
      startEventListener()

      const tour = onboardingsByName.value[name]
      tour.startTour(lastIndexByName.value[name])
    }

    function resetTour(name: OnboardingModel['name']){
      if(!onboardingsByName.value) {
        onboardingsByName.value = {}
      }

      onboardingsByName.value[name].currentStep = 0
      lastIndexByName.value[name] = 0
    }

    const lastEvent = ref<Event>()
    const lastEventEl = ref<HTMLElement>()

    const eventTypes = [
      // Mouse events
      'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave',
      // Keyboard events
      'keydown', 'keyup', 'keypress',
      // Form events
      'submit', 'change', 'input', 'invalid', 'reset',
      // Focus events
      'focus', 'blur', 'focusin', 'focusout',
      // Touch events
      'touchstart', 'touchend', 'touchmove', 'touchcancel',
      // Drag events
      'dragstart', 'drag', 'dragenter', 'dragleave', 'dragover', 'drop', 'dragend',
      // Clipboard events
      'cut', 'copy', 'paste',
      // Selection event
      'select',
      // Wheel event
      'wheel'
    ]

    function handleEvent(e: Event) {
      lastEvent.value = e
      lastEventEl.value = e.target as HTMLElement
      // console.log(`Event: ${e.type}, Target:`, e.target)
    }

    function startEventListener() {
      eventTypes.forEach(eventType => {
        document.addEventListener(eventType, handleEvent, true)
      })
    }

    function stopEventListener() {
      eventTypes.forEach(eventType => {
        document.removeEventListener(eventType, handleEvent, true);
      });
    }

    return {
      addTour,
      startTour,
      resetTour,
      stopEventListener,
      activeOnboarding,
      lastIndexByName,
      lastEvent,
      lastEventEl,
    }
  },
  {
    persist: {
      key: 'onboarding',
      storage: persistedState.localStorage,
    }
  },
)
