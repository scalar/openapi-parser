<script setup lang="ts">
import { fetchUrlsPlugin, openapi } from '@scalar/openapi-parser'
import { watchDebounced } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'

const value = ref(
  JSON.stringify(
    {
      openapi: '3.1.0',
      info: {},
      paths: {
        '/foobar': {
          post: {
            requestBody: {
              $ref: '#/components/requestBodies/Foobar',
            },
          },
        },
      },
      components: {
        requestBodies: {
          Foobar: {
            content: {},
          },
        },
      },
    },
    null,
    2,
  ),
)

const result = ref('')

onMounted(() => {
  const savedValue = window.localStorage.getItem('value')

  if (savedValue) {
    value.value = savedValue
  }
})

watch(value, async (newValue) => {
  window.localStorage.setItem('value', newValue)
})

watchDebounced(
  value,
  async (newValue) => {
    result.value = (
      await openapi()
        .load(newValue, {
          plugins: [fetchUrlsPlugin],
        })
        .dereference()
        .get()
    )?.schema
  },
  {
    debounce: 500,
    maxWait: 1000,
    immediate: true,
  },
)
</script>

<template>
  <div class="preview">
    <div class="preview-left">
      <textarea
        name=""
        id=""
        cols="30"
        rows="10"
        spellcheck="false"
        v-model="value" />
    </div>
    <div class="preview-right">
      <pre id="output">{{ result }}</pre>
    </div>
  </div>
</template>

<style>
.preview {
  padding: 20px;
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: stretch;
  height: 100%;
  gap: 20px;
}

.preview-left {
  width: 50%;
  height: 100%;
  display: flex;
}

.preview-right {
  width: 50%;
  height: 100%;
  font-size: 1rem;
  padding: 20px;
  border-radius: 5px;
  background: #000;
  color: #fff;
  overflow: auto;
}

textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  padding: 0;
  margin: 0;
  font-size: 1rem;
  font-family: monospace;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 5px;
}

pre {
  margin: 0;
}
</style>
