import SwaggerParser from '@apidevtools/swagger-parser'
import { glob } from 'glob'
import { diff } from 'just-diff'
import fs from 'node:fs'
import { describe, expect, test } from 'vitest'

import { AnyObject, normalize, openapi } from '../src'

const expectedErrors = {
  'packages/openapi-parser/tests/files/airport-webappspotcom.yaml': [
    {
      start: { line: 1, column: 1, offset: 0 },
      error: "must have required property 'tokenUrl'",
      path: '/securityDefinitions/google_id_token',
    },
  ],
  'packages/openapi-parser/tests/files/opensuseorgobs.yaml': [
    {
      start: { line: 1, column: 1, offset: 0 },
      error: "must have required property '$ref'",
      path: '/paths/~1published~1{project_name}~1{repository_name}~1{architecture_name}~1{binary_filename}?view=ymp/get/responses/200',
    },
  ],
  'packages/openapi-parser/tests/files/royalmailcomclick-and-drop.yaml': [
    {
      start: { line: 1, column: 1, offset: 0 },
      error: "must have required property 'schema'",
      path: '/parameters/orderIdentifiers',
    },
  ],
  'packages/openapi-parser/tests/files/spotifycom.yaml': [
    {
      start: { line: 1, column: 1, offset: 0 },
      error: 'Can’t resolve URI: ../policies.yaml',
      path: '',
    },
  ],
}

// const invalidFiles = [
//   // TODO: max call stack size exceeded or timeout hit
//   'packages/openapi-parser/tests/files/xerocomxero_accounting.yaml',
//   'packages/openapi-parser/tests/files/xtrfeu.yaml',
//   'packages/openapi-parser/tests/files/webflowcom.yaml',
//   'packages/openapi-parser/tests/files/amazonawscomathena.yaml',
//   'packages/openapi-parser/tests/files/amazonawscomce.yaml',
//   'packages/openapi-parser/tests/files/amazonawscomconnect.yaml',
//   'packages/openapi-parser/tests/files/opentrialslocal.yaml',
//   'packages/openapi-parser/tests/files/bbccouk.yaml',
//   'packages/openapi-parser/tests/files/ote-godaddycomdomains.yaml',
//   'packages/openapi-parser/tests/files/googleapiscomfirebaserules.yaml',
// ]

// const files = (await glob('./packages/openapi-parser/tests/files/*.yaml'))
//   .filter((file) => !invalidFiles.includes(file))
//   // Aphabetic
//   .sort()
// // Random
// // .sort(() => Math.random() - 0.5)

// Just test a few files specifically:
const files = ['packages/openapi-parser/tests/files/bbccouk.yaml']

/**
 * This test suite parses a large number of real-world OpenAPI files
 */
describe('diff', async () => {
  // TODO: We’re currently only testing a few of the files for performance reasons.
  test.each(files.slice(0, 25))('diff: %s', async (file) => {
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
      console.error('[@apidevtools/swagger-parser]', error.message)
    })) as any

    const {
      schema: newSchema,
      valid,
      errors,
    } = await openapi().load(structuredClone(specification)).resolve()

    // Errors expected
    if (expectedErrors[file]) {
      expect(errors).toMatchObject(expectedErrors[file])
      expect(valid).toBe(false)
    }
    // No errors expected
    else {
      // Valid?
      if (!valid) {
        console.log(errors)
      }
      expect(valid).toBe(true)

      // Same number of paths? Or even more?
      expect(Object.keys(oldSchema?.paths ?? {}).length).toBeLessThanOrEqual(
        Object.keys(newSchema?.paths ?? {}).length,
      )

      if (oldSchema) {
        // Any difference?
        let result: any[] = []

        try {
          result = diff(oldSchema, newSchema)
        } catch (error) {
          console.error('[justdiff]', error.message)
        }

        // Log differences
        if (result.length) {
          console.error(
            `⚠️ DIFFERENCES: Found ${result.length} differences in ${file}`,
          )
          console.log()
          result.forEach(({ op, path }) => {
            console.log('* OPERATION:', op)
            console.log('* PATH:', path.join('/'))
            console.log()
            console.log('[@apidevtools/swagger-parser]', get(oldSchema, path))
            console.log('[@scalar/openapi-parser]', get(newSchema, path))
            console.log()
          })
        }

        expect(result.length).toEqual(0)
      }
    }
  })
})

function get(schema: AnyObject, path: (string | number)[]) {
  return path.reduce((acc, key) => acc[key], schema)
}
