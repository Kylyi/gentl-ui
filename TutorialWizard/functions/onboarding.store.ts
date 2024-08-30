// Functions
import { defineStore } from 'pinia'

// Models
import { TutorialWizardModel } from '~/components/TutorialWizard/models/tutorial-wizard.model';

export const useOnboardingStore = defineStore(
  'onboarding',
  () => {
    const onboardingsByName = ref<Record<
      string,
      {
        tour: TutorialWizardModel
        lastStep: number
      }>>({})

    const activeOnboarding = computed(() => {
      return Object.values(onboardingsByName.value).find(onboarding => onboarding.tour.isActive)
    })

    function addTour(onboarding: TutorialWizardModel) {
      if(onboarding.name in onboardingsByName.value) {
        return
      }

      onboardingsByName.value = {
        ...onboardingsByName.value,
        [onboarding.name]: {
          tour: onboarding,
          lastStep: onboarding.currentStep,
        },
      }
    }

    function startTour(name: TutorialWizardModel['name']){
      const tour = onboardingsByName.value[name]
      tour.tour.startTour(tour.lastStep)
    }

    function resetTour(name: TutorialWizardModel['name']){
      onboardingsByName.value[name].lastStep = 0
    }

    return {
      addTour,
      startTour,
      resetTour,
      activeOnboarding,
    }
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  },
)
