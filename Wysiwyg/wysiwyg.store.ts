import type { Editor } from '@tiptap/vue-3'

// Types
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'
import type { IWysiwygFeaturesProps } from '~/components/Wysiwyg/types/wysiwyg-features-props.type'
import type { IWysiwygMentionSetup } from '~/components/Wysiwyg/types/wysiwyg-mention-setup.type'

// Injections
import { wysiwygIdKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'
import type { IWysiwygSinkProps } from '~/components/Wysiwyg/types/wysiwyg-sink-props.type'

export function useWysiwygStore(wysiwygId?: string) {
  const _wysiwygId = injectLocal(wysiwygIdKey, wysiwygId ?? useId())

  return defineStore(`wysiwyg.${_wysiwygId}`, () => {
    const providedData = reactive<IItem>({})

    // Mentions
    const mentionSetup = ref<IWysiwygMentionSetup[] | undefined>()

    // Editor
    const isFocused = ref(false)
    const isEditable = ref(true)
    const editor = shallowRef<Editor>()

    const currentNodeSelection = ref({
      nodes: [] as IItem[],
      marks: [] as IItem[],
    })

    function setEditor(_editor: Editor) {
      editor.value = _editor
    }

    const getEditorValue = ref<() => any>()

    // Files
    const files = ref<IFile[]>([])

    const filesByPath = computed(() => {
      return files.value.reduce((agg, file) => {
        if (file.path) {
          agg[file.path] = file
        }

        return agg
      }, {} as Record<string, IFile>)
    })

    // Features
    const propsFeatures = ref<IWysiwygProps['features']>()

    const features = computed<IWysiwygFeaturesProps | undefined>(() => {
      if (typeof propsFeatures.value === 'string') {
        switch (propsFeatures.value) {
          case 'full':
            return {
              emailButton: true,
              fileUpload: true,
              image: true,
              link: true,
              table: true,
            }

          case 'basic':
            return {
              emailButton: true,
              fileUpload: true,
              image: true,
              link: true,
            }

          case 'none':
            return {
              emailButton: false,
              fileUpload: false,
              image: false,
              link: true,
            }
        }
      }

      return propsFeatures.value as IWysiwygFeaturesProps
    })

    // Sink
    const propsSink = ref<IWysiwygProps['sink']>()

    const sink = computed<IWysiwygSinkProps | undefined>(() => {
      if (typeof propsSink === 'boolean') {
        return {
          enabled: propsSink,
          alwaysVisible: false,
          floating: false,
        }
      }

      return propsSink.value as IWysiwygSinkProps
    })

    function init(props: IWysiwygProps) {
      propsFeatures.value = props.features
      propsSink.value = props.sink
    }

    return {
      editor,
      features,
      sink,
      files,
      filesByPath,
      isEditable,
      isFocused,
      mentionSetup,
      providedData,
      getEditorValue,
      currentNodeSelection,
      setEditor,
      init,
    }
  })()
}
