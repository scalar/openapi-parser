// packages/openapi-parser/vite.config.ts
import dts from "file:///Users/hanspagel/Documents/Projects/openapi-parser/node_modules/.pnpm/vite-plugin-dts@3.7.2_@types+node@20.11.17_typescript@5.3.3_vite@5.1.1/node_modules/vite-plugin-dts/dist/index.mjs";
import { defineConfig } from "file:///Users/hanspagel/Documents/Projects/openapi-parser/node_modules/.pnpm/vitest@1.2.2/node_modules/vitest/dist/config.js";
var vite_config_default = defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: ["src/index.ts"],
      name: "@scalar/openapi-parser",
      formats: ["es"]
    }
  },
  test: {
    coverage: {
      exclude: ["scripts", "tests"],
      enabled: false,
      reporter: "text"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZXMvb3BlbmFwaS1wYXJzZXIvdml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaGFuc3BhZ2VsL0RvY3VtZW50cy9Qcm9qZWN0cy9vcGVuYXBpLXBhcnNlci9wYWNrYWdlcy9vcGVuYXBpLXBhcnNlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2hhbnNwYWdlbC9Eb2N1bWVudHMvUHJvamVjdHMvb3BlbmFwaS1wYXJzZXIvcGFja2FnZXMvb3BlbmFwaS1wYXJzZXIvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2hhbnNwYWdlbC9Eb2N1bWVudHMvUHJvamVjdHMvb3BlbmFwaS1wYXJzZXIvcGFja2FnZXMvb3BlbmFwaS1wYXJzZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGVzdC9jb25maWcnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtkdHMoeyByb2xsdXBUeXBlczogdHJ1ZSB9KV0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogWydzcmMvaW5kZXgudHMnXSxcbiAgICAgIG5hbWU6ICdAc2NhbGFyL29wZW5hcGktcGFyc2VyJyxcbiAgICAgIGZvcm1hdHM6IFsnZXMnXSxcbiAgICB9LFxuICB9LFxuICB0ZXN0OiB7XG4gICAgY292ZXJhZ2U6IHtcbiAgICAgIGV4Y2x1ZGU6IFsnc2NyaXB0cycsICd0ZXN0cyddLFxuICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICByZXBvcnRlcjogJ3RleHQnLFxuICAgIH0sXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnWixPQUFPLFNBQVM7QUFDaGEsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEtBQUssQ0FBQyxDQUFDO0FBQUEsRUFDcEMsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxDQUFDLGNBQWM7QUFBQSxNQUN0QixNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsSUFBSTtBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osVUFBVTtBQUFBLE1BQ1IsU0FBUyxDQUFDLFdBQVcsT0FBTztBQUFBLE1BQzVCLFNBQVM7QUFBQSxNQUNULFVBQVU7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
