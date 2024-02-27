import SwaggerParser from '@apidevtools/swagger-parser'
import { glob } from 'glob'
import { diff } from 'just-diff'
import fs from 'node:fs'
import { describe, expect, test } from 'vitest'

import { normalize, openapi, toJson } from '../src'
import { resolve } from '../src/utils/resolve'

const invalidFiles = [
  'packages/openapi-parser/tests/files/statsocialcom.yaml',
  'packages/openapi-parser/tests/files/spotifycom.yaml',
  'packages/openapi-parser/tests/files/opensuseorgobs.yaml',
  'packages/openapi-parser/tests/files/royalmailcomclick-and-drop.yaml',
]

const files = (
  await glob('./packages/openapi-parser/tests/files/*.yaml')
).filter((file) => !invalidFiles.includes(file))

/**
 * This test suite parses a large number of real-world OpenAPI files
 */
describe('files:parse', async () => {
  test('files.length', () => {
    console.log(files.length)
    expect(Array.isArray(files)).toBe(true)
    expect(files.length).toBeGreaterThan(0)

    if (files.length === 0) {
      console.error(
        'No real-world examples found, try to run `pnpm test:prepare` first.',
      )
    }
  })

  // TODO: We’re currently only testing a few of the files for performance reasons.
  test.each(files.slice(0, 1))('[%s] parse', async (file) => {
    const content = fs.readFileSync(file, 'utf-8')

    const objectData: object = normalize(content)

    const oldParsed = (await new Promise((resolve, reject) => {
      SwaggerParser.dereference(objectData, (error, result) => {
        if (error) reject(error)

        if (result === undefined) {
          reject('Couldn’t parse the Swagger file.')

          return
        }
        resolve(result)
      })
    }).catch((err) => console.error(err))) as any

    // const oldParsed = await SwaggerParser.parse(content)
    const newParsed = (await openapi().load(content).resolve()).schema

    expect(true).toEqual(true)

    console.log(oldParsed?.tags, newParsed.tags)
    console.log(diff(oldParsed, newParsed))
    // expect(oldParsed.tags)).toEqual(Object.keys(newParsed.paths))
    expect(oldParsed.paths).toEqual(newParsed.paths)
  })
})
