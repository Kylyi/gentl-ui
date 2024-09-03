// Functions
import { defineStore } from 'pinia'

// Models
import { TutorialWizardModel } from '~/components/TutorialWizard/models/tutorial-wizard.model';

export const useOnboardingStore = defineStore(
  'onboarding',
  () => {
    const onboardingsByName = ref<Record<
      string,
      TutorialWizardModel
      >>({})
    const lastIndexByName = ref<Record<string, number>>({})

    const activeOnboarding = computed(() => {
      return Object.values(onboardingsByName.value).find(onboarding => onboarding.isActive)
    })

    function addTour(onboarding: TutorialWizardModel) {
      onboardingsByName.value = {
        ...onboardingsByName.value,
        [onboarding.name]: onboarding,
      }

      if(!(onboarding.name in lastIndexByName.value)){
        lastIndexByName.value[onboarding.name] = 0
      }
    }

    function startTour(name: TutorialWizardModel['name']){
      const tour = onboardingsByName.value[name]
      tour.startTour(lastIndexByName.value[name])
    }

    function resetTour(name: TutorialWizardModel['name']){
      if(!onboardingsByName.value) onboardingsByName.value = {}

      onboardingsByName.value[name].currentStep = 0
      lastIndexByName.value[name] = 0
    }

    return {
      addTour,
      startTour,
      resetTour,
      activeOnboarding,
      lastIndexByName,
    }
  },
  {
    persist: {
      key: 'onboarding',
      storage: persistedState.localStorage,
    }
  },
)
