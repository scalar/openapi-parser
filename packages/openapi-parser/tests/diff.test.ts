import SwaggerParser from '@apidevtools/swagger-parser'
import { glob } from 'glob'
import { diff } from 'just-diff'
import fs from 'node:fs'
import { describe, expect, test } from 'vitest'

import { normalize, openapi } from '../src'
import type { AnyObject } from '../src'

const invalidFiles = [
  'packages/openapi-parser/tests/files/statsocialcom.yaml',
  'packages/openapi-parser/tests/files/spotifycom.yaml',
  'packages/openapi-parser/tests/files/opensuseorgobs.yaml',
  'packages/openapi-parser/tests/files/royalmailcomclick-and-drop.yaml',
  // TODO: max call stack size exceeded (could be fixed already)
  'packages/openapi-parser/tests/files/xerocomxero_accounting.yaml',
  'packages/openapi-parser/tests/files/xtrfeu.yaml',
  'packages/openapi-parser/tests/files/webflowcom.yaml',
  'packages/openapi-parser/tests/files/airport-webappspotcom.yaml',
  'packages/openapi-parser/tests/files/amazonawscomathena.yaml',
  // TODO: Those files fail
  'packages/openapi-parser/tests/files/adobecomaem.yaml',
  'packages/openapi-parser/tests/files/adyencomaccountservice.yaml',
  'packages/openapi-parser/tests/files/adyencombalancecontrolservice.yaml',
  'packages/openapi-parser/tests/files/adyencombalanceplatformconfigurationnotification-v1.yaml',
  'packages/openapi-parser/tests/files/adyencombalanceplatformpaymentnotification-v1.yaml',
  'packages/openapi-parser/tests/files/adyencomfundservice.yaml',
  'packages/openapi-parser/tests/files/adyencomhopservice.yaml',
  'packages/openapi-parser/tests/files/adyencomlegalentityservice.yaml',
  'packages/openapi-parser/tests/files/adyencommanagementnotificationservice-v1.yaml',
  'packages/openapi-parser/tests/files/adyencommanagementservice.yaml] dif',
  'packages/openapi-parser/tests/files/adyencombalanceplatformreportnotification-v1.yaml',
  'packages/openapi-parser/tests/files/adyencombalanceplatformservice.yaml',
  'packages/openapi-parser/tests/files/adyencombalanceplatformtransfernotification-v3.yaml',
  'packages/openapi-parser/tests/files/adyencombinlookupservice.yaml',
  'packages/openapi-parser/tests/files/adyencomcheckoutservice.yaml',
  'packages/openapi-parser/tests/files/adyencommanagementservice.yaml',
  'packages/openapi-parser/tests/files/adyencommarketpaynotificationservice.yaml',
  'packages/openapi-parser/tests/files/adyencomnotificationconfigurationservice.yaml',
  'packages/openapi-parser/tests/files/adyencompaymentservice.yaml',
  'packages/openapi-parser/tests/files/adyencompayoutservice.yaml',
  'packages/openapi-parser/tests/files/adyencomrecurringservice.yaml',
  'packages/openapi-parser/tests/files/adyencomstoredvalueservice.yaml',
  'packages/openapi-parser/tests/files/adyencomtestcardservice.yaml',
  'packages/openapi-parser/tests/files/adyencomtfmapiservice.yaml',
  'packages/openapi-parser/tests/files/adyencomtransferservice.yaml',
  'packages/openapi-parser/tests/files/airbytelocalconfig.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-branded-fares-upsell.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-availabilities-search.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-choice-prediction.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-create-orders.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-offers-price.yaml',
  'packages/openapi-parser/tests/files/amadeuscomamadeus-flight-order-management.yaml',
]

const files = (await glob('./packages/openapi-parser/tests/files/*.yaml'))
  .filter((file) => !invalidFiles.includes(file))
  .sort()

/**
 * This test suite parses a large number of real-world OpenAPI files
 */
describe('diff', async () => {
  // TODO: We’re currently only testing a few of the files for performance reasons.
  test.each(files.slice(0, 30))('[%s] diff', async (file) => {
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
    //   oldSchema.paths['/api/v1/itemusages'].post.requestBody,
    // )
    // console.log(
    //   '[@scalar/openapi-parser]',
    //   newSchema.paths['/api/v1/itemusages'].post.requestBody,
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
    expect(result.length).toEqual(0)

    if (result.length) {
      result.forEach(({ op, path }) => {
        console.log(op, get(specification, path))
      })
    }
  })
})

function get(object: AnyObject, path: (string | number)[]) {
  path = structuredClone(path)

  return path.reduce((acc, key) => acc[key], object)
}
