import OriginalSwaggerParser from '@apidevtools/swagger-parser'
import { describe, expect, it } from 'vitest'

import { validate } from '../src/utils/validate'

const myAPI = `{
    "openapi": "3.1.0",
    "info": {
        "title": "Hello World",
        "version": "1.0.0"
    },
    "paths": {}
}`

class SwaggerParser {
  static async validate(api: string, callback: (err: any, api: any) => void) {
    validate(api, {
      throwOnError: true,
    })
      .then((result) => {
        callback(null, result.schema)
      })
      .catch((error) => {
        callback(error, null)
      })
  }
}

// https://github.com/APIDevTools/swagger-parser?tab=readme-ov-file#example
describe('migration-layer', async () => {
  it('validates', async () => {
    return new Promise((resolve, reject) => {
      SwaggerParser.validate(myAPI, (err, api) => {
        if (err) {
          reject(err)
        } else {
          expect(api.info.title).toBe('Hello World')
          expect(api.info.version).toBe('1.0.0')

          resolve(null)
        }
      })
    })
  })

  it('throws an error for invalid documents', async () => {
    return new Promise((resolve, reject) => {
      SwaggerParser.validate('invalid', (err) => {
        if (err) {
          resolve(null)
        } else {
          reject()
        }
      })
    })
  })
})
