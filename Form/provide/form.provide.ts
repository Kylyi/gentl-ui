export const isFormEditingKey: InjectionKey<Ref<boolean>>
  = Symbol('isInEditMode')

export const formSubmitKey: InjectionKey<() => void> = Symbol('formSubmit')
