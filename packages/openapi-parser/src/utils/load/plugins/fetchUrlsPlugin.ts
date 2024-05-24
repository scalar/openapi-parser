import { LoadPlugin } from '../load'

export const fetchUrlsPlugin: () => LoadPlugin = () => {
  return {
    check(value?: any) {
      // Not a string
      if (typeof value !== 'string') {
        return false
      }

      // Not http/https
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return false
      }

      return true
    },
    async get(value?: any) {
      try {
        const response = await fetch(value)

        return await response.text()
      } catch (error) {
        console.error('[fetchUrlsPlugin]', error.message)
      }
    },
  }
}
