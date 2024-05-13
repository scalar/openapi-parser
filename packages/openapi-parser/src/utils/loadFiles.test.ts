import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { loadFiles } from './loadFiles'

const EXAMPLE_FILE = path.join(
  new URL(import.meta.url).pathname,
  '../../../tests/filesystem/api/openapi.yaml',
)

describe('loadFiles', async () => {
  it('loads all files from the filesystem', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)

    expect(filesystem.length).toBe(4)
    expect(filesystem[0].isEntrypoint).toBe(true)
    expect(filesystem[0].filename).toBe('openapi.yaml')
    expect(filesystem[0].references.length).toBe(2)
    expect(filesystem[0].references[0]).toBe('schemas/problem.yaml')
    expect(filesystem[0].references[1]).toBe('schemas/upload.yaml')

    expect(filesystem[1].isEntrypoint).toBe(false)
    expect(filesystem[1].filename).toBe('schemas/problem.yaml')
  })
})
