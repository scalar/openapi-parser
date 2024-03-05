import SwaggerParser from '@apidevtools/swagger-parser'
import { glob } from 'glob'
import { diff } from 'just-diff'
import fs from 'node:fs'
import { describe, expect, test } from 'vitest'

import { normalize, openapi } from '../src'

const invalidFiles = [
  // just invalid
  'packages/openapi-parser/tests/files/spotifycom.yaml',
  'packages/openapi-parser/tests/files/opensuseorgobs.yaml',
  'packages/openapi-parser/tests/files/royalmailcomclick-and-drop.yaml',
  // TODO: max call stack size exceeded
  'packages/openapi-parser/tests/files/xerocomxero_accounting.yaml',
  'packages/openapi-parser/tests/files/xtrfeu.yaml',
  'packages/openapi-parser/tests/files/webflowcom.yaml',
  // TODO: those files fail for some reason
  'packages/openapi-parser/tests/files/airport-webappspotcom.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-branded-fares-upsell.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-availabilities-search.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-choice-prediction.yaml',
  'packages/openapi-parser/tests/files/amazonawscomathena.yaml',
  'packages/openapi-parser/tests/files/amadeuscom.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-cheapest-date-search.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-create-orders.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-inspiration-search.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-offers-price.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-order-management.yaml',
]

const files = (await glob('./packages/openapi-parser/tests/files/*.yaml'))
  .filter((file) => !invalidFiles.includes(file))
  .sort()

// const files = ['packages/openapi-parser/tests/files/airbytelocalconfig.yaml']

/**
 * This test suite parses a large number of real-world OpenAPI files
 */
describe('diff', async () => {
  // TODO: We’re currently only testing a few of the files for performance reasons.
  test.each(files.slice(0, 50))('[%s] diff', async (file) => {
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

    // console.log(
    //   '[SPECIFICATION]',
    //   // @ts-ignore
    //   specification.paths['/api/v1/itemusages'].post.requestBody,
    // )
    // console.log(
    //   '[@apidevtools/swagger-parser]',
    //   oldSchema.paths['/v1/destination_definition_specifications/get']['post'][
    //     'responses'
    //   ]['200']['content']['application/json']['schema']['properties'][
    //     'advancedAuth'
    //   ]['properties']['oauthConfigSpecification']['properties'][
    //     'completeOAuthOutputSpecification'
    //   ],
    // )
    // console.log(
    //   '[@scalar/openapi-parser]',
    //   newSchema.paths['/v1/destination_definition_specifications/get']['post'][
    //     'responses'
    //   ]['200']['content']['application/json']['schema']['properties'][
    //     'advancedAuth'
    //   ]['properties']['oauthConfigSpecification']['properties'][
    //     'completeOAuthOutputSpecification'
    //   ],
    // )
    // console.log(
    //   '[DIFF]',
    //   diff(
    //     oldSchema.paths['/api/v1/itemusages'].post.requestBody,
    //     newSchema.paths['/api/v1/itemusages'].post.requestBody,
    //   ),
    // )

    // expect(
    //   newSchema.paths['/api/v1/itemusages'].post.requestBody,
    // ).toMatchObject(oldSchema.paths['/api/v1/itemusages'].post.requestBody)

    // Valid?
    if (!valid) {
      console.log(errors)
    }
    expect(valid).toBe(true)

    // Same number of paths?
    expect(Object.keys(oldSchema.paths ?? {}).length).toEqual(
      Object.keys(newSchema.paths ?? {}).length,
    )

    // Any difference?
    const result = diff(oldSchema, newSchema)

    if (result.length) {
      console.error(`[DIFF] Found ${result.length} differences in ${file}`)
    }

    if (result.length) {
      console.log()
      result.forEach(({ op, path }) => {
        console.log('[DIFF]', op, path.join('//'))
      })
    }

    expect(result.length).toEqual(0)
  })
})
