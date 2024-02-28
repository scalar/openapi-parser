import SwaggerParser from '@apidevtools/swagger-parser'
import { glob } from 'glob'
import { diff } from 'just-diff'
import fs from 'node:fs'
import { describe, expect, test } from 'vitest'

import { normalize, openapi } from '../src'
import type { AnyObject } from '../src'

// const invalidFiles = [
//   'packages/openapi-parser/tests/files/statsocialcom.yaml',
//   'packages/openapi-parser/tests/files/spotifycom.yaml',
//   'packages/openapi-parser/tests/files/opensuseorgobs.yaml',
//   'packages/openapi-parser/tests/files/royalmailcomclick-and-drop.yaml',
//   // max call stack size exceeded
//   'packages/openapi-parser/tests/files/xerocomxero_accounting.yaml',
//   'packages/openapi-parser/tests/files/xtrfeu.yaml',
//   'packages/openapi-parser/tests/files/webflowcom.yaml',
//   'packages/openapi-parser/tests/files/airport-webappspotcom.yaml',
//   'packages/openapi-parser/tests/files/amazonawscomathena.yaml',
// ]

// const files = (await glob('./packages/openapi-parser/tests/files/*.yaml'))
//   .filter((file) => !invalidFiles.includes(file))
//   .sort()
const files = ['packages/openapi-parser/tests/files/1passwordcomevents.yaml']

/**
 * This test suite parses a large number of real-world OpenAPI files
 */
describe('diff', async () => {
  // TODO: We’re currently only testing a few of the files for performance reasons.
  test.each(files.slice(0, 100))('[%s] diff', async (file) => {
    const content = fs.readFileSync(file, 'utf-8')
    const specification = normalize(content)

    const oldSchema = (await new Promise((resolve, reject) => {
      SwaggerParser.dereference(
        structuredClone(specification) as never,
        (error, result) => {
          if (error) {
            reject(error)
          }

          if (result === undefined) {
            reject('Couldn’t parse the Swagger file.')

            return
          }
          resolve(result)
        },
      )
    }).catch((error) => {
      console.error('[@apidevtools/swagger-parser]', error)
    })) as any

    const {
      schema: newSchema,
      valid,
      errors,
    } = await openapi().load(structuredClone(specification)).resolve()

    console.log(
      specification.paths['/api/v1/itemusages'].post.requestBody,
      oldSchema.paths['/api/v1/itemusages'].post.requestBody,
      newSchema.paths['/api/v1/itemusages'].post.requestBody,
    )

    // // Valid?
    // if (!valid) {
    //   console.log(errors)
    // }
    // expect(valid).toBe(true)

    // // Same number of paths?
    // expect(Object.keys(oldSchema.paths ?? {}).length).toEqual(
    //   Object.keys(newSchema.paths ?? {}).length,
    // )

    // // Any difference?
    // const result = diff(oldSchema, newSchema)
    // expect(result).toEqual([])

    // if (result.length) {
    //   result.forEach(({ op, path }) => {
    //     console.log(op, get(specification, path))
    //   })
    // }
  })
})

function get(object: AnyObject, path: (string | number)[]) {
  path = structuredClone(path)

  return path.reduce((acc, key) => acc[key], object)
}
