import { LoadPlugin } from '../load'

export const fetchUrlsPluginDefaultConfiguration = {
  limit: 10,
}

export const fetchUrlsPlugin: (customConfiguration?: {
  limit?: number | false
}) => LoadPlugin = (customConfiguration) => {
  // State
  let numberOfRequests = 0

  // Configuration
  const configuration = {
    ...fetchUrlsPluginDefaultConfiguration,
    ...customConfiguration,
  }

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
      // Limit ht enumber of requests
      if (
        configuration?.limit !== false &&
        numberOfRequests >= configuration?.limit
      ) {
        console.warn(
          `[fetchUrlsPlugin] Maximum number of requests reeached (${configuration?.limit}), skipping request`,
        )
        return undefined
      }

      try {
        numberOfRequests++
        const response = await fetch(value)

        return await response.text()
      } catch (error) {
        console.error('[fetchUrlsPlugin]', error.message, `(${value})`)
      }
    },
  }
}
