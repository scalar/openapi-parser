import { describe, expect, it } from 'vitest'

import { loadFiles, validate } from '../../../src'
import { relativePath } from '../../../tests/utils'

const EXAMPLE_FILE = relativePath(
  import.meta.url,
  '../../tests/resolveUris/invalid/openapi.yaml',
)

describe('resolveUris', async () => {
  it('returns an error when a reference file can not be found', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)

    const result = await validate(filesystem)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBe(1)
    expect(result.errors[0].error).toBe(
      `Can't resolve schemas/does-not-exist.yaml`,
    )
  })
})
