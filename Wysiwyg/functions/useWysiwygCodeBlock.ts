import defu from 'defu'
import { type BundledLanguage, bundledLanguagesInfo, createHighlighter } from 'shiki'
import { mergeAttributes, Node, textblockTypeInputRule } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import {
  Plugin,
  PluginKey,
  Selection,
  TextSelection,
} from '@tiptap/pm/state'

// Components
import WysiwygCodeBlockComponent from '~/components/Wysiwyg/WysiwygCodeBlock.vue'

export type CodeBlockOptions = {
  /**
   * Adds a prefix to language classes that are applied to code tags.
   * @default 'language-'
   */
  languageClassPrefix: string
  /**
   * Define whether the node should be exited on triple enter.
   * @default true
   */
  exitOnTripleEnter: boolean
  /**
   * Define whether the node should be exited on arrow down if there is no node after it.
   * @default true
   */
  exitOnArrowDown: boolean
  /**
   * The default language.
   * @default null
   * @example 'js'
   */
  defaultLanguage: string | null | undefined
  /**
   * Custom HTML attributes that should be added to the rendered HTML tag.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

/**
 * Matches a code block with backticks.
 */
export const backtickInputRegex = /^```([a-z]+)?\s$/

/**
 * Matches a code block with tildes.
 */
export const tildeInputRegex = /^~~~([a-z]+)?\s$/

declare module '@tiptap/core' {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Commands<ReturnType> {
    codeBlock: {
      /**
       * Set a code block
       * @param attributes Code block attributes
       * @example editor.commands.setCodeBlock({ language: 'javascript' })
       */
      setCodeBlock: (attributes?: { language: string }) => ReturnType
      /**
       * Toggle a code block
       * @param attributes Code block attributes
       * @example editor.commands.toggleCodeBlock({ language: 'javascript' })
       */
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType
    }
  }
}

function WysiwygCodeBlock(options?: CodeBlockOptions) {
  options = defu({
    languageClassPrefix: 'language-',
    exitOnTripleEnter: true,
    exitOnArrowDown: true,
    defaultLanguage: null,
    HTMLAttributes: {},
  }, options)

  return Node.create<CodeBlockOptions>({
    name: 'codeBlock',

    addOptions() {
      return {
        languageClassPrefix: 'language-',
        exitOnTripleEnter: true,
        exitOnArrowDown: true,
        defaultLanguage: null,
        HTMLAttributes: {},
      }
    },

    content: 'text*',

    marks: '',

    group: 'block',

    code: true,

    defining: true,

    addAttributes() {
      return {
        language: {
          default: options.defaultLanguage,
          parseHTML: element => {
            const { languageClassPrefix } = options ?? {}
            const classNames = [...(element.firstElementChild?.classList || [])]

            const languages = classNames
              .filter(className => className.startsWith(languageClassPrefix))
              .map(className => className.replace(languageClassPrefix, ''))
            const language = languages[0]

            if (!language) {
              return null
            }

            return language
          },
          rendered: false,
        },
      }
    },

    parseHTML() {
      return [
        {
          tag: 'pre',
          preserveWhitespace: 'full',
        },
      ]
    },

    renderHTML({ node, HTMLAttributes }) {
      return [
        'pre',
        mergeAttributes(options.HTMLAttributes, HTMLAttributes),
        [
          'code',
          {
            class: node.attrs.language
              ? options.languageClassPrefix + node.attrs.language
              : null,
          },
          0,
        ],
      ]
    },

    addCommands() {
      return {
        setCodeBlock:
          attributes => ({ commands }) => {
            return commands.setNode(this.name, attributes)
          },
        toggleCodeBlock:
          attributes => ({ commands }) => {
            return commands.toggleNode(this.name, 'paragraph', attributes)
          },
      }
    },

    addKeyboardShortcuts() {
      return {
        'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),

        'Backspace': ({ editor }) => {
          const { state } = editor
          const { selection } = state
          const { empty, $anchor } = selection

          if (!empty || $anchor.parent.type.name !== this.name) {
            return false
          }

          // If it's the last character and the content needs to update
          if ($anchor.parent.textContent.length > 0) {
            const tr = state.tr
            tr.delete($anchor.pos - 1, $anchor.pos)
            editor.view.dispatch(tr)

            return true
          } else {
            return this.editor.commands.clearNodes()
          }
        },

        // exit node on triple enter
        'Enter': ({ editor }) => {
          if (!options.exitOnTripleEnter) {
            return false
          }

          const { state } = editor
          const { selection } = state
          const { $from, empty } = selection

          if (!empty || $from.parent.type !== this.type) {
            return false
          }

          const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2
          const endsWithDoubleNewline = $from.parent.textContent.endsWith('\n\n')

          if (!isAtEnd || !endsWithDoubleNewline) {
            return false
          }

          return editor
            .chain()
            .command(({ tr }) => {
              tr.delete($from.pos - 2, $from.pos)

              return true
            })
            .exitCode()
            .run()
        },

        // exit node on arrow down
        'ArrowDown': ({ editor }) => {
          if (!options.exitOnArrowDown) {
            return false
          }

          const { state } = editor
          const { selection, doc } = state
          const { $from, empty } = selection

          if (!empty || $from.parent.type !== this.type) {
            return false
          }

          const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2

          if (!isAtEnd) {
            return false
          }

          const after = $from.after()

          if (after === undefined) {
            return false
          }

          const nodeAfter = doc.nodeAt(after)

          if (nodeAfter) {
            return editor.commands.command(({ tr }) => {
              tr.setSelection(Selection.near(doc.resolve(after)))
              return true
            })
          }

          return editor.commands.exitCode()
        },
      }
    },

    addInputRules() {
      return [
        textblockTypeInputRule({
          find: backtickInputRegex,
          type: this.type,
          getAttributes: match => ({
            language: match[1],
          }),
        }),
        textblockTypeInputRule({
          find: tildeInputRegex,
          type: this.type,
          getAttributes: match => ({
            language: match[1],
          }),
        }),
      ]
    },

    addProseMirrorPlugins() {
      return [
        // this plugin creates a code block for pasted content from VS Code
        // we can also detect the copied code language
        new Plugin({
          key: new PluginKey('codeBlockVSCodeHandler'),
          props: {
            handlePaste: (view, event) => {
              if (!event.clipboardData) {
                return false
              }

              // don’t create a new code block within code blocks
              if (this.editor.isActive(this.type.name)) {
                return false
              }

              const text = event.clipboardData.getData('text/plain')
              const vscode = event.clipboardData.getData('vscode-editor-data')
              const vscodeData = vscode ? JSON.parse(vscode) : undefined
              const language = vscodeData?.mode

              if (!text || !language) {
                return false
              }

              const { tr, schema } = view.state

              // prepare a text node
              // strip carriage return chars from text pasted as code
              // see: https://github.com/ProseMirror/prosemirror-view/commit/a50a6bcceb4ce52ac8fcc6162488d8875613aacd
              const textNode = schema.text(text.replace(/\r\n?/g, '\n'))

              // create a code block with the text node
              // replace selection with the code block
              tr.replaceSelectionWith(this.type.create({ language }, textNode))

              if (tr.selection.$from.parent.type !== this.type) {
                // put cursor inside the newly created code block
                tr.setSelection(TextSelection.near(tr.doc.resolve(Math.max(0, tr.selection.from - 2))))
              }

              // store meta information
              // this is useful for other plugins that depends on the paste event
              // like the paste rule plugin
              tr.setMeta('paste', true)

              view.dispatch(tr)

              return true
            },
          },
        }),
      ]
    },

    addNodeView() {
      // @ts-expect-error
      return VueNodeViewRenderer(WysiwygCodeBlockComponent)
    },
  })
}

// Highlighter
function getHighlighter() {
  return createHighlighter({
    themes: ['vitesse-light'],
    langs: [],
  })
}

export function useWysiwygCodeBlock() {
  const highlighter = getHighlighter()

  async function highlight(content: string, lang: BundledLanguage) {
    const _highlighter = await highlighter

    // Load the language
    await _highlighter.loadLanguage(lang)

    return _highlighter.codeToHtml(
      content,
      { theme: 'vitesse-light', lang },
    )
  }

  return {
    WysiwygCodeBlock,
    highlight,
    languages: bundledLanguagesInfo,
  }
}
