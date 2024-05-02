import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { loadFiles, resolve } from '../../../../src'

const EXAMPLE_FILE = path.join(
  new URL(import.meta.url).pathname,
  '../../pass/externalPathItemRef.yaml',
)

describe('externalPathItemRef', () => {
  it('passes', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)

    const result = resolve(filesystem)

    // TODO: Better expectation
    // expect(result.valid).toBe(true)
    // expect(result.version).toBe('3.0')
  })
})
