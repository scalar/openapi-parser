import OriginalSwaggerParser from '@apidevtools/swagger-parser'
import { describe, expect, it } from 'vitest'

import { dereference } from '../src/utils/dereference'
import { validate } from '../src/utils/validate'

const myAPI = JSON.stringify({
  openapi: '3.1.0',
  info: {
    title: 'Hello World',
    version: '1.0.0',
  },
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
})

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

  static async dereference(api: string) {
    return dereference(api).then((result) => result.schema)
  }
}

// https://github.com/APIDevTools/swagger-parser?tab=readme-ov-file#example
describe('validate', async () => {
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

// https://apitools.dev/swagger-parser/docs/swagger-parser.html#dereferenceapi-options-callback
describe('dereference', () => {
  it('dereferences', async () => {
    let api = await SwaggerParser.dereference(myAPI)

    // The `api` object is a normal JavaScript object,
    // so you can easily access any part of the API using simple dot notation
    expect(api?.paths?.['/foobar']?.post?.requestBody?.content).toEqual({})
  })
})
