import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { load, readFilesPlugin, validate } from '../../../../src'

const EXAMPLE_FILE = path.join(
  new URL(import.meta.url).pathname,
  '../../pass/externalPathItemRef.yaml',
)

describe('externalPathItemRef', () => {
  it('passes', async () => {
    const filesystem = await load(EXAMPLE_FILE, {
      plugins: [readFilesPlugin],
    })

    const result = await validate(filesystem)

    console.log(result)

    // TODO: Better expectation
    // expect(result.valid).toBe(true)
    // expect(result.version).toBe('3.0')
  })
})
