import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      // Resolve the uncompiled source code for all @scalar packages
      // It’s working with the alias, too. It’s just required to enable HMR.
      // It also does not match components since we want the built version
      {
        // Resolve the uncompiled source code for all @scalar packages
        // @scalar/* -> packages/*/
        // (not @scalar/components/*/style.css)
        find: /^@scalar\/(?!(openapi-parser|snippetz|components\/style\.css|components\b))(.+)/,
        replacement: path.resolve(__dirname, '../packages/$2/src/index.ts'),
      },
    ],
  },
})
