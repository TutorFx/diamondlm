<script setup lang="ts">
import { Placeholder } from '@tiptap/extension-placeholder'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { Markdown } from '@tiptap/markdown'

const props = withDefaults(defineProps<{ placeholder?: string }>(), {
  placeholder: 'Digite aqui...'
})

const model = defineModel<string>()

const editor = useEditor({
  content: model.value,
  editorProps: {
    attributes: {
      class: 'min-w-full prose text-neutral-300 focus:outline-none mx-auto [--tw-prose-bold:theme(colors.red.300)] [--tw-prose-headings:theme(colors.red.300)]'
    }
  },
  onUpdate: ({ editor }) => {
    model.value = editor.getMarkdown()
  },
  extensions: [
    Markdown,
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder
    }),
    Underline
  ]
})

watch(model, (newValue) => {
  if (editor.value && newValue && newValue !== editor.value.getMarkdown()) {
    editor.value.commands.setContent(newValue, { parseOptions: { preserveWhitespace: 'full' } })
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <UCard :ui="{ body: 'flex-1 overflow-y-auto', root: 'h-full flex flex-col rounded-none' }">
    <template #header>
      <div class="grid grid-flow-col justify-start items-center gap-2">
        <div v-if="editor" class="flex flex-wrap gap-1">
          <UButton
            size="xs"
            icon="material-symbols:undo"
            :variant="editor.can().undo() ? 'solid' : 'subtle'"
            @click="editor.chain().focus().undo().run()"
          />
          <UButton
            size="xs"
            icon="material-symbols:redo"
            :variant="editor.can().redo() ? 'solid' : 'subtle'"
            @click="editor.chain().focus().redo().run()"
          />
        </div>
        <USeparator orientation="vertical" />
        <div v-if="editor" class="flex flex-wrap gap-1">
          <UButton
            size="xs"
            icon="material-symbols:format-bold-rounded"
            :variant="editor.isActive('bold') ? 'solid' : 'subtle'"
            @click="editor.chain().focus().toggleBold().run()"
          />
          <UButton
            size="xs"
            icon="material-symbols:format-italic"
            :variant="editor.isActive('italic') ? 'solid' : 'subtle'"
            @click="editor.chain().focus().toggleItalic().run()"
          />
          <UButton
            size="xs"
            icon="material-symbols:format-underlined"
            :variant="editor.isActive('underline') ? 'solid' : 'subtle'"
            @click="editor.chain().focus().toggleUnderline().run()"
          />
          <UButton
            v-for="heading in 5"
            :key="`heading-${heading}`"
            size="xs"
            :icon="`material-symbols:format-h${heading}`"
            :variant="editor.isActive('heading', { level: heading }) ? 'solid' : 'subtle'"
            @click="editor.chain().focus().toggleHeading({ level: heading as 1 | 2 | 3 | 4 | 5 }).run()"
          />
        </div>
        <USeparator orientation="vertical" />
        <div class="flex flex-wrap gap-1">
          <slot />
        </div>
      </div>
    </template>
    <EditorContent :editor="editor" />
  </UCard>
</template>
