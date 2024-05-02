import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { loadFiles, resolveReferences } from '../../../../src'

const EXAMPLE_FILE = path.join(
  new URL(import.meta.url).pathname,
  '../../pass/externalPathItemRef.yaml',
)

describe('externalPathItemRef', () => {
  it('passes', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)

    const result = await resolveReferences(filesystem)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
